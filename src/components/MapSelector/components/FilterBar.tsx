import { useLang } from "../../../LangContext";
import { t } from "../../../i18n";

const PRICE_MIN = 4000;
const PRICE_MAX = 18000;

type Props = {
  filters: {
    type: string[];
    cat: string[];
    zone: string[];
    tags: string[];
  };
  maxPrice: number | null;
  priceSliderOpen: boolean;
  priceSliderVisible: boolean;
  sliderValue: number;
  pricePopupPos: { top: number; left: number };
  priceButtonRef: React.RefObject<HTMLButtonElement | null>;
  onToggleFilter: (
    key: "type" | "cat" | "zone" | "tags",
    value: string,
  ) => void;
  onClearTagFilters: () => void;
  onOpenPriceSlider: () => void;
  onClosePriceSlider: () => void;
  onSliderChange: (value: number) => void;
  onApplyPrice: () => void;
  onClearPrice: () => void;
  onFilterBarResize: (height: number) => void;
  headerOffset: number;
  isScrolled?: boolean;
  zIndex?: number;
};

export default function FilterBar({
  filters,
  maxPrice,
  priceSliderOpen,
  priceSliderVisible,
  sliderValue,
  pricePopupPos,
  priceButtonRef,
  onToggleFilter,
  onClearTagFilters,
  onOpenPriceSlider,
  onClosePriceSlider,
  onSliderChange,
  onApplyPrice,
  onClearPrice,
  onFilterBarResize,
  headerOffset,
  isScrolled,
  zIndex = 100,
}: Props) {
  const { lang } = useLang();
  const T = t[lang];

  return (
    <div
      ref={(node) => {
        if (!node) return;
        const ro = new ResizeObserver(() =>
          onFilterBarResize(node.offsetHeight),
        );
        ro.observe(node);
        onFilterBarResize(node.offsetHeight);
        (node as HTMLDivElement & { _ro?: ResizeObserver })._ro?.disconnect();
        (node as HTMLDivElement & { _ro?: ResizeObserver })._ro = ro;
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: zIndex,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0",
        pointerEvents: "none",
        paddingBottom: "0",
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
        {/* 카테고리 칩 행 */}
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            scrollbarWidth: "none",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "2px",
              padding: "0 16px",
              width: "max-content",
            }}
          >
            {[
              { key: "전체", label: T.catAll },
              { key: "한식", label: T.catKorean },
              { key: "일식", label: T.catJapanese },
              { key: "중식", label: T.catChinese },
              { key: "간편식·분식", label: T.catSnack },
              { key: "양식·아시안", label: T.catWestern },
            ].map((item) => {
              const isActive =
                item.key === "전체"
                  ? filters.cat.includes("전체")
                  : filters.cat.includes(item.key);
              return (
                <button
                  key={item.key}
                  onClick={() => onToggleFilter("cat", item.key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: isActive
                      ? "1.5px solid #0066ff"
                      : "1.5px solid #d1d5db",
                    background: isActive ? "#0066ff" : "white",
                    color: isActive ? "white" : "#333",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 태그 칩 행 */}
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            scrollbarWidth: "none",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "2px",
              padding: "0 16px",
              width: "max-content",
            }}
          >
            {/* 전체해제 버튼 */}
            {(() => {
              const isActive = filters.tags.length > 0 || maxPrice !== null;
              return (
                <button
                  onClick={() => {
                    if (isActive) onClearTagFilters();
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: isActive
                      ? "1.5px solid #d1d5db"
                      : "1.5px solid #e5e7eb",
                    background: isActive ? "white" : "rgba(0,0,0,0.03)",
                    color: isActive ? "#333" : "#bbb",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: isActive ? "pointer" : "default",
                    whiteSpace: "nowrap",
                    pointerEvents: "auto",
                    transition: "all 0.15s ease",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0_403_3590)">
                      <path
                        d="M21.9999 12C22.0077 14.3266 21.2068 16.5835 19.7342 18.3848C18.2616 20.186 16.2088 21.4195 13.9271 21.8742C11.6454 22.329 9.27662 21.9767 7.226 20.8776C5.17538 19.7786 3.57041 18.0011 2.68571 15.8493C1.80101 13.6975 1.69157 11.3051 2.37611 9.08149C3.06064 6.8579 4.49662 4.94129 6.43833 3.6596C8.38003 2.37791 10.7068 1.81081 13.0205 2.05532C15.3342 2.29983 17.491 3.34076 19.1219 5H14.9999V7H20.1429C20.6353 6.99947 21.1073 6.80365 21.4554 6.45551C21.8036 6.10737 21.9994 5.63535 21.9999 5.143V0H19.9999V3.078C17.9532 1.24945 15.3409 0.178752 12.5997 0.0448441C9.8584 -0.0890641 7.15421 0.721932 4.93904 2.34229C2.72388 3.96266 1.13196 6.29421 0.429326 8.94729C-0.273305 11.6004 -0.0440735 14.4142 1.07871 16.9186C2.2015 19.423 4.14981 21.4661 6.59803 22.7066C9.04625 23.947 11.846 24.3096 14.5295 23.7338C17.213 23.158 19.6175 21.6786 21.3412 19.5429C23.065 17.4072 24.0035 14.7445 23.9999 12H21.9999Z"
                        fill={isActive ? "#333" : "#bbb"}
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_403_3590">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  {T.clearFilter}
                </button>
              );
            })()}

            {/* 가격 필터 버튼 */}
            <div style={{ position: "relative" }}>
              <button
                ref={priceButtonRef}
                onClick={() =>
                  priceSliderOpen ? onClosePriceSlider() : onOpenPriceSlider()
                }
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border:
                    maxPrice !== null
                      ? "1.5px solid #0066ff"
                      : "1.5px solid #d1d5db",
                  background: maxPrice !== null ? "#0066ff" : "white",
                  color: maxPrice !== null ? "white" : "#333",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {maxPrice !== null
                  ? `💰 ~${maxPrice.toLocaleString()}${T.priceUnitPlain}`
                  : T.priceFilter}
              </button>

              {/* 슬라이더 팝업 */}
              {priceSliderOpen && (
                <>
                  <div
                    onClick={onClosePriceSlider}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 200,
                      pointerEvents: "auto",
                    }}
                  />
                  <div
                    style={{
                      position: "fixed",
                      top: pricePopupPos.top,
                      left: pricePopupPos.left,
                      zIndex: 201,
                      pointerEvents: "auto",
                      background: "rgba(255,255,255,0.97)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      borderRadius: "16px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                      border: "1px solid rgba(255,255,255,0.6)",
                      padding: "16px 20px",
                      width: "260px",
                      opacity: priceSliderVisible ? 1 : 0,
                      transform: priceSliderVisible
                        ? "translateY(0) scale(1)"
                        : "translateY(-8px) scale(0.96)",
                      transformOrigin: "top left",
                      transition:
                        "opacity 0.18s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#888",
                        marginBottom: "14px",
                      }}
                    >
                      {T.priceFilterLabel}
                    </div>
                    <div style={{ textAlign: "center", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontSize: "28px",
                          fontWeight: 900,
                          color: "#0066ff",
                        }}
                      >
                        {sliderValue.toLocaleString()}
                      </span>
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#0066ff",
                          marginLeft: "3px",
                        }}
                      >
                        {T.priceUnitPlain}
                      </span>
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#555",
                        marginBottom: "14px",
                      }}
                    >
                      {T.minPrice} {sliderValue.toLocaleString()}
                      {T.priceUnitPlain} {T.priceFilterDesc}
                    </div>
                    <input
                      type="range"
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      step={500}
                      value={sliderValue}
                      onChange={(e) => onSliderChange(Number(e.target.value))}
                      style={{
                        width: "100%",
                        accentColor: "#0066ff",
                        cursor: "pointer",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11px",
                        color: "#bbb",
                        marginTop: "4px",
                        marginBottom: "4px",
                      }}
                    >
                      <span>
                        {PRICE_MIN.toLocaleString()}
                        {T.priceUnitPlain}
                      </span>
                      <span>
                        {PRICE_MAX.toLocaleString()}
                        {T.priceUnitPlain}
                      </span>
                    </div>
                    {maxPrice !== null && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearPrice();
                        }}
                        style={{
                          width: "100%",
                          marginTop: "6px",
                          padding: "7px 0",
                          borderRadius: "8px",
                          border: "1.5px solid #e0e0e0",
                          background: "white",
                          color: "#888",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {T.priceFilterAll}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyPrice();
                      }}
                      style={{
                        marginTop: "14px",
                        width: "100%",
                        padding: "10px 0",
                        borderRadius: "10px",
                        border: "none",
                        background: "#0066ff",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {T.apply}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* 나머지 태그 칩 */}
            {[
              { key: "👤 혼밥", label: T.tagSolo },
              { key: "💪 고단백", label: T.tagProtein },
              { key: "🥗 건강식", label: T.tagHealthy },
            ].map((item) => {
              const isActive = filters.tags.includes(item.key);
              return (
                <button
                  key={item.key}
                  onClick={() => onToggleFilter("tags", item.key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: isActive
                      ? "1.5px solid #0066ff"
                      : "1.5px solid #d1d5db",
                    background: isActive ? "#0066ff" : "white",
                    color: isActive ? "white" : "#333",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
