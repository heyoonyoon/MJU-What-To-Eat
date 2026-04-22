import type { CSSProperties } from "react";
import type { CardItem } from "../hooks/useCardDeck";
import type { Lang } from "../../../i18n";

const CARD_COLORS = [
  "#5B8CFF", "#FF6B6B", "#FFD93D", "#6BCB77",
  "#FF922B", "#CC5DE8", "#20C997", "#F06595",
];

const CATEGORY_EMOJI: Record<string, string> = {
  한식: "🍚", 일식: "🍣", 중식: "🥢", "간편식·분식": "🍜",
  고기: "🥩", "양식·아시안": "🍝", 주류: "🍺", "카페·디저트": "☕", 종합: "🍽️",
};

// 각 stack 위치별 정적 transform 값
export function rotateAt(_o: number) { return 0; }
export function scaleAt(_o: number) { return 1; }
export function transYAt(_o: number) { return 0; }

export function transformStr(o: number) {
  return `rotate(${rotateAt(o)}deg) scale(${scaleAt(o)}) translateY(${transYAt(o)}px)`;
}

export function transZAt(o: number): number { return -o * 8; }

// 두 offset 사이 보간 (3D)
export function lerpTransform(from: number, to: number, p: number) {
  const ro = rotateAt(from) + (rotateAt(to) - rotateAt(from)) * p;
  const sc = scaleAt(from) + (scaleAt(to) - scaleAt(from)) * p;
  const ty = transYAt(from) + (transYAt(to) - transYAt(from)) * p;
  const tz = transZAt(from) + (transZAt(to) - transZAt(from)) * p;
  return `rotate(${ro}deg) scale(${sc}) translateY(${ty}px) translateZ(${tz}px)`;
}

export function cardColor(item: CardItem): string {
  const idx = Math.abs(
    item.restaurant.id.charCodeAt(0) + (item.menu.menuId.charCodeAt(0) || 0)
  ) % CARD_COLORS.length;
  return CARD_COLORS[idx];
}

type Props = {
  item: CardItem;
  lang: Lang;
  transform: string;
  transition: string;
  zIndex: number;
  cursor?: CSSProperties["cursor"];
  transformOrigin?: string;
};

export default function MenuCard({ item, lang, transform, transition, zIndex, cursor, transformOrigin }: Props) {
  const { restaurant: r, menu: m } = item;
  const menuName = m.name[lang] || m.name.ko;
  const emoji = CATEGORY_EMOJI[r.category] ?? "🍽️";

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: 28,
        backgroundColor: cardColor(item),
        boxShadow: "none",
        transform,
        transition,
        transformOrigin: transformOrigin ?? "center center",
        zIndex,
        userSelect: "none",
        cursor: cursor ?? "default",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "relative", height: "100%",
        display: "flex", flexDirection: "column",
        padding: "32px 28px 28px", justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            display: "inline-block", background: "rgba(255,255,255,0.25)",
            borderRadius: 20, padding: "4px 14px", fontSize: 13,
            fontWeight: 600, color: "#fff", marginBottom: 12,
          }}>
            {r.category}
          </div>
          <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 10 }}>{emoji}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1.25, wordBreak: "keep-all" }}>
            {menuName}
          </div>
        </div>
        <div>
          {m.price != null && (
            <div style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.95)", marginBottom: 8 }}>
              {m.price.toLocaleString()}원
            </div>
          )}
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
            {r.name}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
            {r.zone}구역 · {r.type}
          </div>
          {m.tags && m.tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {m.tags.map((tag) => (
                <span key={tag} style={{
                  background: "rgba(255,255,255,0.22)", borderRadius: 12,
                  padding: "3px 10px", fontSize: 12, color: "#fff", fontWeight: 500,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
