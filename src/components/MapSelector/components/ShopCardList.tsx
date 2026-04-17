import { useLang } from "../../../LangContext";
import { t, CAT_KEY_MAP, TAG_KEY_MAP } from "../../../i18n";
import type { Restaurant } from "../../../types/restaurant";
import { useVirtualScroll } from "../hooks/useVirtualScroll";

type Props = {
  filteredList: Restaurant[];
  menuFilterBarHeight: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onRestaurantClick: (r: Restaurant) => void;
};

const SHOP_ROW_H = 72;
const OVERSCAN = 3;

export default function ShopCardList({
  filteredList,
  menuFilterBarHeight,
  scrollRef,
  onRestaurantClick,
}: Props) {
  const { lang } = useLang();
  const T = t[lang];
  const { scrollTop, containerHeight } = useVirtualScroll(scrollRef);

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

  const totalContentH = filteredList.length * SHOP_ROW_H + menuFilterBarHeight;
  const firstIdx = Math.floor(Math.max(0, scrollTop) / SHOP_ROW_H);
  const visibleStart = Math.max(0, firstIdx - OVERSCAN);
  const lastIdx = Math.ceil((scrollTop + containerHeight) / SHOP_ROW_H);
  const visibleEnd = Math.min(filteredList.length, lastIdx + OVERSCAN);
  const topSpacerH = visibleStart * SHOP_ROW_H;
  const bottomSpacerH = (filteredList.length - visibleEnd) * SHOP_ROW_H;

  if (filteredList.length === 0) {
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
    <div
      style={{
        height: totalContentH,
        position: "relative",
      }}
    >
      <div
        style={{
          height: topSpacerH,
          background: topSpacerH > 0 ? "white" : undefined,
        }}
      />
      <div style={{ background: "white" }}>
        {filteredList.slice(visibleStart, visibleEnd).map((r) => {
          const minPrice = r.menus.reduce<number | null>((min, m) => {
            if (m.price == null) return min;
            return min == null ? m.price : Math.min(min, m.price);
          }, null);
          return (
            <div
              key={r.id}
              onClick={() => onRestaurantClick(r)}
              style={{
                height: SHOP_ROW_H,
                borderBottom: "1px solid #f0f0f0",
                padding: "0 16px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "3px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#111",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.name}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#888",
                      background: "#f5f5f5",
                      borderRadius: "5px",
                      padding: "1px 6px",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {translateLabel(r.category)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#aaa",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.menus.map((m) => menuName(m.name)).join(" · ")}
                </div>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0066ff",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {minPrice != null
                  ? `${minPrice.toLocaleString()}${T.priceUnitPlain}~`
                  : T.noMinPrice}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          height: bottomSpacerH,
          background: bottomSpacerH > 0 ? "white" : undefined,
        }}
      />
    </div>
  );
}
