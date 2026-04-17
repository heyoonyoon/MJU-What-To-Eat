import { useLang } from "../../../LangContext";
import { t } from "../../../i18n";
import type { SortOrder } from "../hooks/useFilterState";

const SORT_ORDERS: SortOrder[] = ["default", "priceLow", "priceHigh"];

type Props = {
  sortOrder: SortOrder;
  pos: { top: number; left: number };
  visible: boolean;
  onSortChange: (order: SortOrder) => void;
  onClose: () => void;
};

export default function SortDropdown({ sortOrder, pos, visible, onSortChange, onClose }: Props) {
  const { lang } = useLang();
  const T = t[lang];

  const labelOf = (order: SortOrder) =>
    order === "priceLow" ? T.sortPriceLow : order === "priceHigh" ? T.sortPriceHigh : T.sortDefault;

  return (
    <>
      <div
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "auto" }}
      />
      <div
        style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          zIndex: 9999,
          pointerEvents: "auto",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.6)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minWidth: "160px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.96)",
          transformOrigin: "top left",
          transition: "opacity 0.18s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {SORT_ORDERS.map((order) => {
          const isActive = sortOrder === order;
          return (
            <button
              key={order}
              onClick={() => { onSortChange(order); onClose(); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: isActive ? "rgba(0,102,255,0.08)" : "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: isActive ? 700 : 400,
                color: isActive ? "#0066ff" : "#333",
                whiteSpace: "nowrap",
                textAlign: "left",
              }}
            >
              {isActive ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="#0066ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span style={{ width: "12px" }} />
              )}
              {labelOf(order)}
            </button>
          );
        })}
      </div>
    </>
  );
}
