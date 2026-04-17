import { useState } from "react";
import { useLang } from "../../../LangContext";
import { t } from "../../../i18n";
import BottomSheet from "../../BottomSheet";

const PRICE_MIN = 4000;
const PRICE_MAX = 18000;

type LocalFilters = { cat: string[]; tags: string[] };

type Props = {
  filters: { cat: string[]; tags: string[] };
  maxPrice: number | null;
  onApply: (filters: LocalFilters, maxPrice: number | null) => void;
  onClose: () => void;
  onSheetReady: (node: HTMLDivElement | null) => void;
  onOverlayReady: (node: HTMLDivElement | null) => void;
  onDragStart: (clientX: number, clientY: number) => void;
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
  onApply,
  onClose,
  onSheetReady,
  onOverlayReady,
  onDragStart,
}: Props) {
  const { lang } = useLang();
  const T = t[lang];

  const [localCat, setLocalCat] = useState<string[]>(filters.cat);
  const [localTags, setLocalTags] = useState<string[]>(filters.tags);
  const [priceEnabled, setPriceEnabled] = useState(maxPrice !== null);
  const [sliderValue, setSliderValue] = useState(maxPrice ?? PRICE_MAX);

  const toggleCat = (key: string) => {
    if (key === "전체") {
      setLocalCat(["전체"]);
    } else {
      setLocalCat((prev) => {
        const without = prev.filter((v) => v !== "전체" && v !== key);
        const added = prev.includes(key) ? without : [...without, key];
        return added.length === 0 ? ["전체"] : added;
      });
    }
  };

  const toggleTag = (key: string) =>
    setLocalTags((prev) =>
      prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]
    );

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
    <BottomSheet
      onClose={onClose}
      onSheetReady={onSheetReady}
      onOverlayReady={onOverlayReady}
      onDragStart={onDragStart}
      maxHeight="80vh"
    >
      {/* 헤더: 타이틀 + X 버튼 (드래그 가능) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 20px 12px",
          borderBottom: "1px solid #f0f0f0",
          flexShrink: 0,
          cursor: "grab",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
        onTouchStart={(e) => onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
      >
        <span style={{ fontSize: "17px", fontWeight: 700, color: "#111" }}>{T.filterSheet}</span>
        <button
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{ background: "none", border: "none", fontSize: "20px", color: "#aaa", cursor: "pointer", padding: "0 4px" }}
        >
          ✕
        </button>
      </div>

      {/* 스크롤 콘텐츠 */}
      <div style={{ overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#888", marginBottom: "10px", letterSpacing: "0.4px", textTransform: "uppercase" }}>
            {T.labelFood}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            <button onClick={() => toggleCat("전체")} style={chipStyle(localCat.includes("전체"))}>
              {T.catAll}
            </button>
            {CAT_OPTIONS.map(({ key, i18n }) => (
              <button key={key} onClick={() => toggleCat(key)} style={chipStyle(!localCat.includes("전체") && localCat.includes(key))}>
                {T[i18n]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#888", marginBottom: "10px", letterSpacing: "0.4px", textTransform: "uppercase" }}>
            {T.labelTag}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {TAG_OPTIONS.map(({ key, i18n }) => (
              <button key={key} onClick={() => toggleTag(key)} style={chipStyle(localTags.includes(key))}>
                {T[i18n]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#888", letterSpacing: "0.4px", textTransform: "uppercase" }}>
              {T.priceFilter}
            </div>
          </div>
          <div style={{ textAlign: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "24px", fontWeight: 900, color: priceEnabled ? "#0066ff" : "#aaa" }}>
              {sliderValue.toLocaleString()}
            </span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: priceEnabled ? "#0066ff" : "#aaa", marginLeft: "3px" }}>
              {T.priceUnitPlain}
            </span>
          </div>
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={500}
            value={sliderValue}
            onChange={(e) => { setSliderValue(Number(e.target.value)); setPriceEnabled(true); }}
            style={{ width: "100%", accentColor: "#0066ff", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#bbb", marginTop: "4px" }}>
            <span>{PRICE_MIN.toLocaleString()}{T.priceUnitPlain}</span>
            <span>{PRICE_MAX.toLocaleString()}{T.priceUnitPlain}</span>
          </div>
        </div>
      </div>

      {/* 적용 버튼 */}
      <div style={{ padding: "12px 20px", flexShrink: 0, borderTop: "1px solid #f0f0f0" }}>
        <button
          onClick={() => onApply({ cat: localCat, tags: localTags }, priceEnabled ? sliderValue : null)}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: "12px",
            border: "none",
            background: "#0066ff",
            color: "white",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {T.apply}
        </button>
      </div>

      <div style={{ height: "env(safe-area-inset-bottom, 16px)", flexShrink: 0 }} />
    </BottomSheet>
  );
}
