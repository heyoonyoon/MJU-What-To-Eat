import { useLang } from "../../../LangContext";
import { t, CAT_KEY_MAP, TAG_KEY_MAP } from "../../../i18n";
import type { SortOrder } from "../../../store/useSearchStore";
import SortDropdown from "./SortDropdown";
import SearchChip from "./SearchChip";

type Props = {
  filters: {
    type: string[];
    cat: string[];
    zone: string[];
    tags: string[];
  };
  maxPrice: number | null;
  searchQuery: string;
  appliedTarget: "name" | "menu";
  onClearSearch: () => void;
  sortOrder: SortOrder;
  sortDropdownOpen: boolean;
  sortDropdownVisible: boolean;
  sortDropdownPos: { top: number; left: number };
  sortBtnRef: React.RefObject<HTMLButtonElement | null>;
  filterSheetOpen: boolean;
  onSortChange: (order: SortOrder) => void;
  onOpenSortDropdown: () => void;
  onCloseSortDropdown: () => void;
  onOpenFilterSheet: () => void;
  onToggleFilter: (key: "type" | "cat" | "zone" | "tags", value: string) => void;
  onClearPrice: () => void;
  onFilterBarResize: (height: number) => void;
  headerOffset: number;
  zIndex?: number;
  isMapTab?: boolean;
};

const CHIP_BASE: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  gap: "4px",
  transition: "all 0.15s ease",
};

const X_ICON = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export default function FilterBar({
  filters,
  maxPrice,
  searchQuery,
  appliedTarget,
  onClearSearch,
  sortOrder,
  sortDropdownOpen,
  sortDropdownVisible,
  sortDropdownPos,
  sortBtnRef,
  onSortChange,
  onOpenSortDropdown,
  onCloseSortDropdown,
  onOpenFilterSheet,
  onToggleFilter,
  onClearPrice,
  onFilterBarResize,
  headerOffset,
  zIndex = 100,
  isMapTab = false,
}: Props) {
  const { lang } = useLang();
  const T = t[lang];

  const sortLabel =
    sortOrder === "priceLow" ? T.sortPriceLow :
    sortOrder === "priceHigh" ? T.sortPriceHigh :
    T.sortDefault;

  const activeCats = filters.cat.filter((c) => c !== "전체");
  const activeTags = filters.tags;
  const hasActiveFilters = activeCats.length > 0 || activeTags.length > 0 || maxPrice !== null;
  const activeFilterCount = activeCats.length + activeTags.length + (maxPrice !== null ? 1 : 0);

  return (
    <div
      ref={(node) => {
        if (!node) return;
        const ro = new ResizeObserver(() => onFilterBarResize(node.offsetHeight));
        ro.observe(node);
        onFilterBarResize(node.offsetHeight);
        (node as HTMLDivElement & { _ro?: ResizeObserver })._ro?.disconnect();
        (node as HTMLDivElement & { _ro?: ResizeObserver })._ro = ro;
      }}
      style={{
        position: "absolute",
        top: 8,
        left: 12,
        right: 12,
        zIndex,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          paddingTop: `${headerOffset + 10}px`,
          paddingBottom: "10px",
          background: "transparent",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            scrollbarWidth: "none",
            pointerEvents: "auto",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
            maskImage: "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "6px",
              padding: "0 16px",
              width: "max-content",
            }}
          >
            {/* 정렬 칩 */}
            <button
              ref={sortBtnRef}
              onClick={() => !isMapTab && (sortDropdownOpen ? onCloseSortDropdown() : onOpenSortDropdown())}
              style={{
                ...CHIP_BASE,
                border: isMapTab ? "1.5px solid #e0e0e0" : sortOrder !== "default" ? "1.5px solid #0066ff" : "1.5px solid #d1d5db",
                background: isMapTab ? "#f5f5f5" : sortOrder !== "default" ? "#0066ff" : "white",
                color: isMapTab ? "#bbb" : sortOrder !== "default" ? "white" : "#333",
                cursor: isMapTab ? "not-allowed" : "pointer",
                opacity: isMapTab ? 0.6 : 1,
                transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M3 6H21M6 12H18M10 18H14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              {sortLabel}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7 }}>
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* 필터 칩 */}
            <button
              onClick={onOpenFilterSheet}
              style={{
                ...CHIP_BASE,
                border: hasActiveFilters ? "1.5px solid #0066ff" : "1.5px solid #d1d5db",
                background: hasActiveFilters ? "#0066ff" : "white",
                color: hasActiveFilters ? "white" : "#333",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {T.filterSheet}
              {hasActiveFilters && (
                <span style={{
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "999px",
                  padding: "0 5px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* 검색 칩 */}
            <SearchChip
              searchQuery={searchQuery}
              appliedTarget={appliedTarget}
              onClear={onClearSearch}
            />

            {/* 선택된 카테고리 칩들 */}
            {activeCats.map((cat) => (
              <button
                key={cat}
                onClick={() => onToggleFilter("cat", cat)}
                style={{ ...CHIP_BASE, border: "1.5px solid #0066ff", background: "rgba(0,102,255,0.08)", color: "#0066ff" }}
              >
                {T[CAT_KEY_MAP[cat]] ?? cat}
                {X_ICON}
              </button>
            ))}

            {/* 선택된 태그 칩들 */}
            {activeTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onToggleFilter("tags", tag)}
                style={{ ...CHIP_BASE, border: "1.5px solid #0066ff", background: "rgba(0,102,255,0.08)", color: "#0066ff" }}
              >
                {T[TAG_KEY_MAP[tag]] ?? tag}
                {X_ICON}
              </button>
            ))}

            {/* 가격 필터 칩 */}
            {maxPrice !== null && (
              <button
                onClick={onClearPrice}
                style={{ ...CHIP_BASE, border: "1.5px solid #0066ff", background: "rgba(0,102,255,0.08)", color: "#0066ff" }}
              >
                💰 ~{maxPrice.toLocaleString()}{T.priceUnitPlain}
                {X_ICON}
              </button>
            )}

          </div>
        </div>
      </div>

      {/* 정렬 드롭다운 */}
      {sortDropdownOpen && (
        <SortDropdown
          sortOrder={sortOrder}
          pos={sortDropdownPos}
          visible={sortDropdownVisible}
          onSortChange={onSortChange}
          onClose={onCloseSortDropdown}
        />
      )}
    </div>
  );
}
