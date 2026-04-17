import { useLang } from "../../../LangContext";
import { t, CAT_KEY_MAP, TAG_KEY_MAP } from "../../../i18n";
import type { Restaurant } from "../../../types/restaurant";
import { useVirtualScroll } from "../hooks/useVirtualScroll";

import type { Menu } from "../../../types/restaurant";

type MenuItem = { restaurant: Restaurant; menu: Menu };

type Props = {
  allMenuItems: MenuItem[];
  menuFilterBarHeight: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  isRolled?: boolean; // Added for roll animation
  onRestaurantClick: (r: Restaurant) => void;
};

const OVERSCAN = 3;

export default function MenuCardList({
  allMenuItems,
  menuFilterBarHeight,
  scrollRef,
  isRolled, // Extracted
  onRestaurantClick,
}: Props) {
  const { lang } = useLang();
  const T = t[lang];
  const { scrollTop, containerHeight, containerWidth } =
    useVirtualScroll(scrollRef);

  const translateLabel = (label: string): string => {
    const catKey = CAT_KEY_MAP[label];
    if (catKey) return T[catKey] ?? label;
    const tagKey = TAG_KEY_MAP[label];
    if (tagKey) return T[tagKey] ?? label;
    return label;
  };

  const menuName = (name: {
    ko: string;
    en: string;
    zh: string;
    ja: string;
    vi: string;
  }) => name[lang] || name.ko;

  const w = containerWidth;
  const cols = w >= 1024 ? 5 : w >= 768 ? 4 : w >= 640 ? 3 : 2;
  const gap = 10;
  const hPad = 12;
  const cellW = w > 0 ? (w - hPad * 2 - gap * (cols - 1)) / cols : 0;
  const GRID_ROW_H = cellW > 0 ? Math.round(cellW * 0.7) + gap : 140;
  const totalRows = Math.ceil(allMenuItems.length / cols);
  const totalContentH = totalRows * GRID_ROW_H;
  
  // padding-top만큼 스크롤 위치 보정 (안하면 스크롤 시 topSpacer 계산이 어긋나 순간이동 발생)
  const contentScrollTop = Math.max(0, scrollTop - menuFilterBarHeight);
  const scrolledRows = Math.floor(contentScrollTop / GRID_ROW_H);
  const startRow = Math.max(0, scrolledRows - OVERSCAN);
  const visibleStart = startRow * cols;
  const endRows = Math.ceil((contentScrollTop + containerHeight) / GRID_ROW_H);
  const endRow = Math.min(totalRows, Math.ceil(endRows + OVERSCAN));
  const visibleEnd = Math.min(allMenuItems.length, endRow * cols);

  const visibleItems = allMenuItems.slice(visibleStart, visibleEnd);
  const topSpacerH = Math.floor(visibleStart / cols) * GRID_ROW_H;
  const bottomSpacerH =
    Math.ceil((allMenuItems.length - visibleEnd) / cols) * GRID_ROW_H;

  if (allMenuItems.length === 0) {
    return (
      <div style={{ height: totalContentH, position: "relative" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
            color: "#aaa",
            fontSize: "14px",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "32px" }}>🍽️</span>
          <span>{T.searchNoResult}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: totalContentH, position: "relative" }}>
      <div style={{ height: topSpacerH }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridAutoRows: `${GRID_ROW_H - gap}px`,
          gap: `${gap}px`,
          padding: `0 ${hPad}px`,
        }}
      >
        {visibleItems.map(({ restaurant: r, menu: m }) => (
          <div
            key={`${r.id}-${m.menuId}`}
            onClick={() => onRestaurantClick(r)}
            className={isRolled ? "roll-winning-anim" : ""}
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
              border: "1px solid rgba(0,0,0,0.04)",
              cursor: "pointer",
              minWidth: 0,
              overflow: "hidden",
            }}
          >

            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#111",
                lineHeight: 1.3,
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {menuName(m.name)}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#888",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {r.name}
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#0066ff",
                marginTop: "auto",
              }}
            >
              {m.price != null
                ? `${m.price.toLocaleString()}${T.priceUnitPlain}`
                : T.noMinPrice}
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: bottomSpacerH }} />
    </div>
  );
}
