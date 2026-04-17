import type { Restaurant } from "../types/restaurant";
import type { Lang } from "../i18n";
import { t } from "../i18n";

export type MarkerModeKey = "price" | "menu" | "name";
export type MarkerModes = Set<MarkerModeKey>;

export interface Cluster {
  restaurants: Restaurant[];
  lat: number;
  lng: number;
}

/**
 * 픽셀 기준으로 마커들을 클러스터링한다.
 * - CLUSTER_MIN_SIZE 이상인 그룹은 클러스터로 묶음
 * - 2개짜리 그룹은 singles로 풀어서 수직 나열 (StackedGroup)
 * - 1개는 단일 마커
 *
 * 새 반환값:
 *   clusters     = 3개 이상 → 클러스터 버블 (가격 요약 표시)
 *   singles      = 1개짜리 or 2개 그룹에서 해제된 것들
 *   stackedGroups= 동일 건물(매우 근접, STACK_PIXEL 이내)에 있는 2개 이상 식당 그룹
 *                  → 원래 위치에 수직으로 나열
 */
const CLUSTER_MIN_SIZE = 3; // 이 이상이면 클러스터 버블
const GRID_PIXEL = 60;      // 클러스터 격자 크기 (픽셀)
const STACK_PIXEL = 10;     // 이 이내면 "같은 건물" → 수직 나열

export interface StackedGroup {
  restaurants: Restaurant[];
  lat: number;
  lng: number;
}

function latLngToPixel(
  map: naver.maps.Map,
  lat: number,
  lng: number,
): { x: number; y: number } {
  const proj = map.getProjection();
  const point = proj.fromCoordToOffset(new window.naver.maps.LatLng(lat, lng));
  return { x: point.x, y: point.y };
}

export function computeClusters(
  visibleRestaurants: Restaurant[],
  map: naver.maps.Map,
): { clusters: Cluster[]; singles: Restaurant[]; stackedGroups: StackedGroup[] } {
  if (visibleRestaurants.length === 0) return { clusters: [], singles: [], stackedGroups: [] };

  // 픽셀 좌표로 변환
  const entries = visibleRestaurants
    .filter((r) => r.lat && r.lng)
    .map((r) => ({
      r,
      px: latLngToPixel(map, r.lat, r.lng),
    }));

  const assigned = new Set<string>();
  const clusters: Cluster[] = [];
  const singles: Restaurant[] = [];
  const stackedGroups: StackedGroup[] = [];

  for (let i = 0; i < entries.length; i++) {
    const a = entries[i];
    if (assigned.has(a.r.id)) continue;

    const group: typeof entries = [a];
    assigned.add(a.r.id);

    for (let j = i + 1; j < entries.length; j++) {
      const b = entries[j];
      if (assigned.has(b.r.id)) continue;
      const dx = a.px.x - b.px.x;
      const dy = a.px.y - b.px.y;
      if (Math.sqrt(dx * dx + dy * dy) < GRID_PIXEL) {
        group.push(b);
        assigned.add(b.r.id);
      }
    }

    if (group.length >= CLUSTER_MIN_SIZE) {
      // 클러스터 버블: 평균 위치에 배치
      const lat = group.reduce((s, e) => s + e.r.lat, 0) / group.length;
      const lng = group.reduce((s, e) => s + e.r.lng, 0) / group.length;
      clusters.push({ restaurants: group.map((e) => e.r), lat, lng });
    } else if (group.length >= 2) {
      // 2개 그룹: 픽셀 거리가 STACK_PIXEL 이내면 수직 나열, 아니면 singles로 풀기
      const dx = group[0].px.x - group[1].px.x;
      const dy = group[0].px.y - group[1].px.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < STACK_PIXEL) {
        // 완전히 같은 위치 → 수직 나열
        const lat = group.reduce((s, e) => s + e.r.lat, 0) / group.length;
        const lng = group.reduce((s, e) => s + e.r.lng, 0) / group.length;
        stackedGroups.push({ restaurants: group.map((e) => e.r), lat, lng });
      } else {
        // 조금 떨어져 있으면 개별 마커로
        singles.push(...group.map((e) => e.r));
      }
    } else {
      singles.push(group[0].r);
    }
  }

  return { clusters, singles, stackedGroups };
}

/**
 * 클러스터 마커 — 단순화 (개수만 표시)
 * 파란색 배경 + 흰색 텍스트
 * 그림자·그라데이션 없음 (플랫 디자인)
 */
export function buildClusterContent(
  restaurants: Restaurant[],
  lang: Lang,
  filteredMenuIds?: Set<string> | null,
): string {
  const T = t[lang];
  const count = restaurants.length;

  let minPrice: number | null = null;
  for (const r of restaurants) {
    const menus = r.menus || [];
    const visibleMenus =
      filteredMenuIds != null
        ? menus.filter((m) => filteredMenuIds.has(`${r.id}-${m.menuId}`))
        : menus;
    const candidate =
      visibleMenus.length > 0
        ? visibleMenus.reduce<number | null>((acc, m) => {
            if (m.price == null) return acc;
            return acc == null ? m.price : Math.min(acc, m.price);
          }, null)
        : r.minPrice ?? null;
    if (candidate != null && (minPrice == null || candidate < minPrice)) {
      minPrice = candidate;
    }
  }

  const priceText =
    minPrice != null
      ? `<span style="color:rgba(255,255,255,0.85);font-size:11px;font-weight:600;margin-left:5px;white-space:nowrap;">${minPrice.toLocaleString()}${T.priceUnit}</span>`
      : "";

  return `<div style="
    display:inline-flex;
    align-items:center;
    justify-content:center;
    border-radius:16px;
    background:#0066ff;
    border:2px solid white;
    cursor:pointer;
    padding:0 10px;
    height:28px;
    box-sizing: border-box;
  ">
    <span style="color:white;font-size:13px;font-weight:800;line-height:1;white-space:nowrap;">${count}개${priceText}</span>
  </div>`;
}

/**
 * 수직 나열 마커 (같은 건물에 여러 식당이 있을 때)
 * 가격 pill들을 수직으로 배열, 각각 원래 좌표에 배치
 */
export function buildStackedMarkerContent(
  shops: Restaurant[],
  lang: Lang,
  modes: MarkerModes,
  filteredMenuIds?: Set<string> | null,
): string {
  const T = t[lang];

  const items = shops.map((shop) => {
    const lines: string[] = [];
    const menus = shop.menus || [];
    const visibleMenus =
      filteredMenuIds != null
        ? menus.filter((m) => filteredMenuIds.has(`${shop.id}-${m.menuId}`))
        : menus;

    if (modes.has("price")) {
      const matchedMin =
        visibleMenus.length > 0
          ? visibleMenus.reduce<number | null>((acc, m) => {
              if (m.price == null) return acc;
              return acc == null ? m.price : Math.min(acc, m.price);
            }, null)
          : shop.minPrice;
      const priceText =
        matchedMin != null
          ? `<span style="color:#0066ff;">${matchedMin.toLocaleString()}${T.priceUnit}</span>`
          : `<span style="color:#aaa;">${T.noPrice}</span>`;
      lines.push(priceText);
    }
    if (modes.has("name")) {
      lines.push(
        `<span style="font-size:11px;font-weight:500;color:#111;">${shop.name}</span>`,
      );
    }
    if (modes.has("menu")) {
      const primaryMatched = visibleMenus.filter((m) => m.isPrimary);
      const displayMenus = primaryMatched.length > 0 ? primaryMatched : visibleMenus;
      const menuName = displayMenus[0]?.name[lang] || displayMenus[0]?.name.ko || "";
      const rest = displayMenus.length - 1;
      const menuText = rest > 0 ? `${menuName} +${rest}` : menuName;
      if (menuText)
        lines.push(
          `<span style="font-size:10px;font-weight:500;color:#666;font-style:italic;">${menuText}</span>`,
        );
    }

    const inner = lines.map((l) => `<div style="line-height:1.4;">${l}</div>`).join("");
    return `<div style="background:white;padding:4px 8px;border-radius:10px;border:1.5px solid #0066ff;font-size:11px;font-weight:700;color:#333;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.12);line-height:1.5;">${inner}</div>`;
  });

  // 수직으로 쌓기, 간격 4px
  return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;">
    ${items.join("")}
  </div>`;
}

export function buildSingleMarkerContent(
  shop: Restaurant,
  lang: Lang,
  modes: MarkerModes,
  filteredMenuIds?: Set<string> | null,
): string {
  const T = t[lang];
  const lines: string[] = [];

  const menus = shop.menus || [];
  const visibleMenus =
    filteredMenuIds != null
      ? menus.filter((m) => filteredMenuIds.has(`${shop.id}-${m.menuId}`))
      : menus;

  if (modes.has("price")) {
    const matchedMin =
      visibleMenus.length > 0
        ? visibleMenus.reduce<number | null>((acc, m) => {
            if (m.price == null) return acc;
            return acc == null ? m.price : Math.min(acc, m.price);
          }, null)
        : shop.minPrice;
    const priceText =
      matchedMin != null
        ? `<span style="color:#0066ff;">${matchedMin.toLocaleString()}${T.priceUnit}</span>`
        : `<span style="color:#aaa;">${T.noPrice}</span>`;
    lines.push(priceText);
  }
  if (modes.has("name")) {
    lines.push(
      `<span style="font-size:12px;font-weight:500;color:#111;letter-spacing:-0.3px;">${shop.name}</span>`,
    );
  }
  if (modes.has("menu")) {
    const primaryMatched = visibleMenus.filter((m) => m.isPrimary);
    const displayMenus = primaryMatched.length > 0 ? primaryMatched : visibleMenus;
    const MAX_CHARS = 25;
    let menuText = "";
    let shown = 0;
    for (const m of displayMenus) {
      const name = m.name[lang] || m.name.ko;
      const candidate = menuText ? `${menuText}, ${name}` : name;
      if (candidate.length > MAX_CHARS) break;
      menuText = candidate;
      shown++;
    }
    const rest = displayMenus.length - shown;
    if (rest > 0) menuText += ` ...+${rest}`;
    if (menuText)
      lines.push(
        `<span style="font-size:10px;font-weight:500;color:#666;font-style:italic;">${menuText}</span>`,
      );
  }

  const inner = lines.map((l) => `<div style="line-height:1.4;">${l}</div>`).join("");
  return `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;"><div style="background:white;padding:4px 8px;border-radius:10px;border:1.5px solid #0066ff;font-size:11px;font-weight:700;color:#333;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.15);line-height:1.5;">${inner}</div></div>`;
}
