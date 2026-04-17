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
 * 줌 레벨에 따라 grid 크기가 달라진다.
 * CLUSTER_MIN_SIZE 이상인 그룹만 클러스터로, 나머지는 개별 마커로 반환한다.
 */
const CLUSTER_MIN_SIZE = 3; // 이 이상이면 클러스터로 묶음
const GRID_PIXEL = 60; // 클러스터 격자 크기 (픽셀)

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
): { clusters: Cluster[]; singles: Restaurant[] } {
  if (visibleRestaurants.length === 0) return { clusters: [], singles: [] };

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

  for (let i = 0; i < entries.length; i++) {
    const a = entries[i];
    if (assigned.has(a.r.id)) continue;

    const group: Restaurant[] = [a.r];
    assigned.add(a.r.id);

    for (let j = i + 1; j < entries.length; j++) {
      const b = entries[j];
      if (assigned.has(b.r.id)) continue;
      const dx = a.px.x - b.px.x;
      const dy = a.px.y - b.px.y;
      if (Math.sqrt(dx * dx + dy * dy) < GRID_PIXEL) {
        group.push(b.r);
        assigned.add(b.r.id);
      }
    }

    if (group.length >= CLUSTER_MIN_SIZE) {
      // 클러스터 중심 = 평균 lat/lng
      const lat = group.reduce((s, r) => s + r.lat, 0) / group.length;
      const lng = group.reduce((s, r) => s + r.lng, 0) / group.length;
      clusters.push({ restaurants: group, lat, lng });
    } else {
      singles.push(...group);
    }
  }

  return { clusters, singles };
}

export function buildClusterContent(count: number): string {
  return `<div style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:#0066ff;border:3px solid white;box-shadow:0 2px 8px rgba(0,102,255,0.4);cursor:pointer;"><span style="color:white;font-size:14px;font-weight:800;">${count}</span></div>`;
}

export function buildSingleMarkerContent(
  shop: Restaurant,
  lang: Lang,
  modes: MarkerModes,
  filteredMenuIds?: Set<string> | null,
): string {
  const T = t[lang];
  const lines: string[] = [];

  const visibleMenus =
    filteredMenuIds != null
      ? shop.menus.filter((m) => filteredMenuIds.has(`${shop.id}-${m.menuId}`))
      : shop.menus;

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
