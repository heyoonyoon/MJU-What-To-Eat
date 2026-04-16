import { useLang } from "../../../LangContext";
import { t, CAT_KEY_MAP, TAG_KEY_MAP } from "../../../i18n";
import type { Restaurant } from "../../../data2";

type MenuItem = { restaurant: Restaurant; menu: Restaurant["menus"][number] };

type Props = {
  allMenuItems: MenuItem[];
  menuViewMode: "grid" | "list";
  menuScrollTop: number;
  menuContainerHeight: number;
  menuContainerWidth: number;
  menuFilterBarHeight: number;
  onRestaurantClick: (r: Restaurant) => void;
};

const OVERSCAN = 3;
const LIST_ROW_H = 65;

export default function MenuCardList({
  allMenuItems,
  menuViewMode,
  menuScrollTop,
  menuContainerHeight,
  menuContainerWidth,
  menuFilterBarHeight,
  onRestaurantClick,
}: Props) {
  const { lang } = useLang();
  const T = t[lang];

  const translateLabel = (label: string): string => {
    const catKey = CAT_KEY_MAP[label];
    if (catKey) return T[catKey] ?? label;
    const tagKey = TAG_KEY_MAP[label];
    if (tagKey) return T[tagKey] ?? label;
    return label;
  };

  const menuName = (name: { ko: string; en: string; zh: string; ja: string; vi: string }) =>
    name[lang] || name.ko;

  const w = menuContainerWidth;
  const cols = w >= 1024 ? 5 : w >= 768 ? 4 : w >= 640 ? 3 : 2;
  const gap = 10;
  const hPad = 12;
  const cellW = w > 0 ? (w - hPad * 2 - gap * (cols - 1)) / cols : 0;
  const GRID_ROW_H = cellW > 0 ? Math.round(cellW * 0.9) + gap : 160;
  const PADDING_H = menuFilterBarHeight;
  const isGrid = menuViewMode === "grid";

  let totalContentH: number;
  let visibleStart: number;
  let visibleEnd: number;

  if (isGrid) {
    const totalRows = Math.ceil(allMenuItems.length / cols);
    totalContentH = totalRows * GRID_ROW_H + PADDING_H;
    const scrolledRows = Math.floor(Math.max(0, menuScrollTop) / GRID_ROW_H);
    const startRow = Math.max(0, scrolledRows - OVERSCAN);
    visibleStart = startRow * cols;
    const endRows = Math.ceil((menuScrollTop + menuContainerHeight) / GRID_ROW_H);
    const endRow = Math.min(totalRows, Math.ceil(endRows + OVERSCAN));
    visibleEnd = Math.min(allMenuItems.length, endRow * cols);
  } else {
    totalContentH = allMenuItems.length * LIST_ROW_H + PADDING_H;
    const firstIdx = Math.floor(Math.max(0, menuScrollTop) / LIST_ROW_H);
    visibleStart = Math.max(0, firstIdx - OVERSCAN);
    const lastIdx = Math.ceil((menuScrollTop + menuContainerHeight) / LIST_ROW_H);
    visibleEnd = Math.min(allMenuItems.length, lastIdx + OVERSCAN);
  }

  const visibleItems = allMenuItems.slice(visibleStart, visibleEnd);
  const topSpacerH = isGrid ? Math.floor(visibleStart / cols) * GRID_ROW_H : visibleStart * LIST_ROW_H;
  const bottomSpacerH = isGrid
    ? Math.ceil((allMenuItems.length - visibleEnd) / cols) * GRID_ROW_H
    : (allMenuItems.length - visibleEnd) * LIST_ROW_H;

  if (allMenuItems.length === 0) {
    return (
      <div style={{ height: totalContentH, position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "#aaa", fontSize: "14px", gap: "8px" }}>
          <span style={{ fontSize: "32px" }}>🍽️</span>
          <span>{T.searchNoResult}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: totalContentH, position: "relative" }}>
      {isGrid ? (
        <>
          <div style={{ height: topSpacerH }} />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gap}px`, padding: `0 ${hPad}px` }}>
            {visibleItems.map(({ restaurant: r, menu: m }) => (
              <div
                key={`${r.id}-${m.menuId}`}
                onClick={() => onRestaurantClick(r)}
                style={{ background: "white", borderRadius: "14px", padding: "12px", display: "flex", flexDirection: "column", gap: "5px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.04)", cursor: "pointer", minWidth: 0, overflow: "hidden" }}
              >
                <span style={{ fontSize: "10px", fontWeight: 600, color: "#888", background: "#f5f5f5", borderRadius: "6px", padding: "2px 7px", alignSelf: "flex-start", whiteSpace: "nowrap" }}>
                  {translateLabel(r.category)}
                </span>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#111", lineHeight: 1.3, wordBreak: "break-word", overflowWrap: "break-word" }}>
                  {menuName(m.name)}
                </div>
                <div style={{ fontSize: "11px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.name}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0066ff", marginTop: "auto" }}>
                  {m.price != null ? `${m.price.toLocaleString()}${T.priceUnitPlain}` : T.noMinPrice}
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: bottomSpacerH }} />
        </>
      ) : (
        <>
          <div style={{ height: topSpacerH, background: topSpacerH > 0 ? "white" : undefined }} />
          <div style={{ background: "white" }}>
            {visibleItems.map(({ restaurant: r, menu: m }) => (
              <div
                key={`${r.id}-${m.menuId}`}
                onClick={() => onRestaurantClick(r)}
                style={{ height: LIST_ROW_H, borderBottom: "1px solid #f0f0f0", padding: "0 16px", display: "flex", flexDirection: "row", alignItems: "center", gap: "12px", cursor: "pointer", boxSizing: "border-box" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {menuName(m.name)}
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: 600, color: "#888", background: "#f5f5f5", borderRadius: "5px", padding: "1px 6px", flexShrink: 0, whiteSpace: "nowrap" }}>
                      {translateLabel(r.category)}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.name}
                  </div>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0066ff", flexShrink: 0, whiteSpace: "nowrap" }}>
                  {m.price != null ? `${m.price.toLocaleString()}${T.priceUnitPlain}` : T.noMinPrice}
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: bottomSpacerH, background: bottomSpacerH > 0 ? "white" : undefined }} />
        </>
      )}
    </div>
  );
}
