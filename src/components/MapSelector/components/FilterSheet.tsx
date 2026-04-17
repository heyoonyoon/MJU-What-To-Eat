import { useState } from "react";
import { useLang } from "../../../LangContext";
import { t } from "../../../i18n";

const PRICE_MIN = 4000;
const PRICE_MAX = 18000;

type Filters = {
  type: string[];
  cat: string[];
  zone: string[];
  tags: string[];
};

type Props = {
  filters: Filters;
  maxPrice: number | null;
  onToggleFilter: (key: "type" | "cat" | "zone" | "tags", value: string) => void;
  onApplyPrice: (value: number | null) => void;
  onClose: () => void;
  isClosing: boolean;
};

const CAT_OPTIONS = [
  { key: "한식", i18n: "catKorean" },
  { key: "일식", i18n: "catJapanese" },
  { key: "중식", i18n: "catChinese" },
  { key: "간편식·분식", i18n: "catSnack" },
  { key: "양식·아시안", i18n: "catWestern" },
] as const;

const TAG_OPTIONS = [
  { key: "👤 혼밥", i18n: "tagSolo" },
  { key: "💪 고단백", i18n: "tagProtein" },
  { key: "🥗 건강식", i18n: "tagHealthy" },
] as const;

export default function FilterSheet({
  filters,
  maxPrice,
  onToggleFilter,
  onApplyPrice,
  onClose,
  isClosing,
}: Props) {
  const { lang } = useLang();
  const T = t[lang];
  const [sliderValue, setSliderValue] = useState(maxPrice ?? PRICE_MAX);

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: "7px 14px",
    borderRadius: "999px",
    border: active ? "1.5px solid #0066ff" : "1.5px solid #d1d5db",
    background: active ? "#0066ff" : "white",
    color: active ? "white" : "#333",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  });

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "rgba(0,0,0,0.35)",
          animation: isClosing ? "overlayFadeOut 0.23s ease forwards" : "overlayFadeIn 0.2s ease forwards",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10001,
          background: "#ffffff",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.13)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "80vh",
          animation: isClosing ? "filterSheetSlideDown 0.23s cubic-bezier(0.4,0,1,1) forwards" : "shopModalSlideUp 0.32s cubic-bezier(0.2,0.8,0.2,1) forwards",
        }}
      >
        {/* 핸들 */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "12px", paddingBottom: "4px", flexShrink: 0 }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#e0e0e0" }} />
        </div>

        {/* 헤더 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 20px 12px",
          flexShrink: 0,
          borderBottom: "1px solid #f0f0f0",
        }}>
          <span style={{ fontSize: "17px", fontWeight: 700, color: "#111" }}>{T.filterSheet}</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "20px", color: "#aaa", cursor: "pointer", padding: "0 4px" }}
          >
            ✕
          </button>
        </div>

        {/* 컨텐츠 */}
        <div style={{ overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* 카테고리 */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#888", marginBottom: "10px", letterSpacing: "0.4px", textTransform: "uppercase" }}>
              {T.labelFood}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <button
                onClick={() => onToggleFilter("cat", "전체")}
                style={chipStyle(filters.cat.includes("전체"))}
              >
                {T.catAll}
              </button>
              {CAT_OPTIONS.map(({ key, i18n }) => (
                <button
                  key={key}
                  onClick={() => onToggleFilter("cat", key)}
                  style={chipStyle(!filters.cat.includes("전체") && filters.cat.includes(key))}
                >
                  {T[i18n]}
                </button>
              ))}
            </div>
          </div>

          {/* 태그 */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#888", marginBottom: "10px", letterSpacing: "0.4px", textTransform: "uppercase" }}>
              {T.labelTag}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {TAG_OPTIONS.map(({ key, i18n }) => (
                <button
                  key={key}
                  onClick={() => onToggleFilter("tags", key)}
                  style={chipStyle(filters.tags.includes(key))}
                >
                  {T[i18n]}
                </button>
              ))}
            </div>
          </div>

          {/* 가격 슬라이더 */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#888", marginBottom: "10px", letterSpacing: "0.4px", textTransform: "uppercase" }}>
              {T.priceFilter}
            </div>
            <div style={{ textAlign: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "24px", fontWeight: 900, color: maxPrice !== null ? "#0066ff" : "#ccc" }}>
                {sliderValue.toLocaleString()}
              </span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: maxPrice !== null ? "#0066ff" : "#ccc", marginLeft: "3px" }}>
                {T.priceUnitPlain}
              </span>
            </div>
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={500}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#0066ff", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#bbb", marginTop: "4px" }}>
              <span>{PRICE_MIN.toLocaleString()}{T.priceUnitPlain}</span>
              <span>{PRICE_MAX.toLocaleString()}{T.priceUnitPlain}</span>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              {maxPrice !== null && (
                <button
                  onClick={() => { onApplyPrice(null); setSliderValue(PRICE_MAX); }}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: "10px",
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
                onClick={() => onApplyPrice(sliderValue)}
                style={{
                  flex: 2,
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
          </div>
        </div>

        {/* safe area */}
        <div style={{ height: "env(safe-area-inset-bottom, 16px)", flexShrink: 0 }} />
      </div>
    </>
  );
}
