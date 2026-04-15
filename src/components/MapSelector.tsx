import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import type { Restaurant } from "../data2";
import { restaurants } from "../data2";
import NaverMap from "./NaverMap";
import { useLang } from "../LangContext";
import { t, LANG_LABELS, LANGS, CAT_KEY_MAP, TAG_KEY_MAP } from "../i18n";
import type { Lang } from "../i18n";

export default function MapSelector() {
  const { lang, setLang } = useLang();
  const T = t[lang];

  const [filters, setFilters] = useState<{
    type: string[];
    cat: string[];
    zone: string[];
    tags: string[];
  }>({
    type: [],
    cat: ["전체"],
    zone: [],
    tags: [],
  });
  const [mapDisplayList, setMapDisplayList] =
    useState<Restaurant[]>(restaurants);
  const [focusTarget, setFocusTarget] = useState<Restaurant | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [showHint1, setShowHint1] = useState(true);
  const [copyToasts, setCopyToasts] = useState<
    { id: number; text: string; fading: boolean }[]
  >([]);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const scrollHintEnabledRef = useRef(false);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);
  const headerRowRef = useRef<HTMLDivElement | null>(null);
  const titleIslandRef = useRef<HTMLDivElement | null>(null);
  const [snackbarWidth, setSnackbarWidth] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    if (titleIslandRef.current) {
      setSnackbarWidth(titleIslandRef.current.offsetWidth);
    }
  }, [lang]);

  const handleModalScroll = useCallback(() => {
    if (!scrollHintEnabledRef.current) return;
    const el = modalScrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    setIsScrolledToBottom(atBottom);
  }, []);

  const applyTagFilter = (r: Restaurant, tags: string[]) => {
    if (tags.length === 0) return true;
    return tags.every((tag) => {
      if (tag === "👤 혼밥") return r.solo;
      if (tag === "💸 저렴이") return r.filters.isCheap;
      if (tag === "💪 고단백") return r.filters.isHighProtein;
      if (tag === "🥗 건강식") return r.filters.isHealthy;
      return true;
    });
  };

  const showCopyToast = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    const id = Date.now();
    setCopyToasts((prev) => [
      ...prev,
      { id, text: `"${label}" ${T.copied}`, fading: false },
    ]);
    setTimeout(
      () =>
        setCopyToasts((prev) =>
          prev.map((tt) => (tt.id === id ? { ...tt, fading: true } : tt)),
        ),
      1600,
    );
    setTimeout(
      () => setCopyToasts((prev) => prev.filter((tt) => tt.id !== id)),
      2000,
    );
  };

  const filteredList = useMemo<Restaurant[]>(() => {
    return restaurants.filter((r) => {
      const typeOk = filters.type.length === 0 || filters.type.includes(r.type);
      const catOk =
        filters.cat.includes("전체") || filters.cat.includes(r.category);
      const zoneOk = filters.zone.length === 0 || filters.zone.includes(r.zone);
      const tagsOk = applyTagFilter(r, filters.tags);
      return typeOk && catOk && zoneOk && tagsOk;
    });
  }, [filters]);

  const toggleFilterDirect = (
    key: "type" | "cat" | "zone" | "tags",
    value: string,
  ) => {
    setFilters((prev) => {
      let next: typeof prev;
      if (key === "cat" && value === "전체") {
        next = { ...prev, [key]: ["전체"] };
      } else if (key === "cat" && value !== "전체") {
        const newCat = prev[key].includes(value)
          ? prev[key].filter((v) => v !== value)
          : [...prev[key].filter((v) => v !== "전체"), value];
        next = { ...prev, [key]: newCat.length === 0 ? ["전체"] : newCat };
      } else {
        next = {
          ...prev,
          [key]: prev[key].includes(value)
            ? prev[key].filter((v) => v !== value)
            : [...prev[key], value],
        };
      }
      // 즉시 지도 업데이트
      const newList = restaurants.filter((r) => {
        const typeOk = next.type.length === 0 || next.type.includes(r.type);
        const catOk =
          next.cat.includes("전체") || next.cat.includes(r.category);
        const zoneOk = next.zone.length === 0 || next.zone.includes(r.zone);
        const tagsOk = applyTagFilter(r, next.tags);
        return typeOk && catOk && zoneOk && tagsOk;
      });
      setMapDisplayList(newList);
      return next;
    });
  };

  const handleRoll = () => {
    const shuffled = [...filteredList].sort(() => 0.5 - Math.random());
    const result = shuffled.slice(0, 1);
    setMapDisplayList(result);
    setFocusTarget(result[0] ?? null);
  };

  // Translate a label (Korean category/tag key) to current language
  const translateLabel = (label: string): string => {
    const catKey = CAT_KEY_MAP[label];
    if (catKey) return T[catKey] ?? label;
    const tagKey = TAG_KEY_MAP[label];
    if (tagKey) return T[tagKey] ?? label;
    return label;
  };

  // Menu name display by lang
  const menuName = (name: {
    ko: string;
    en: string;
    zh: string;
    ja: string;
    vi: string;
  }) => name[lang] || name.ko;

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <NaverMap
        displayList={mapDisplayList}
        focusTarget={focusTarget}
        onMarkerClick={(r) => {
          setSelectedRestaurant(r);
          scrollHintEnabledRef.current = false;
          setIsScrolledToBottom(false);
          setTimeout(() => {
            const el = modalScrollRef.current;
            if (!el) return;
            const enabled = el.scrollHeight - el.clientHeight >= 120;
            scrollHintEnabledRef.current = enabled;
            setIsScrolledToBottom(!enabled);
          }, 0);
        }}
      />

      {/* 상단 헤더 + 스낵바 묶음 */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          zIndex: 160,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "6px",
        }}
      >
        {/* 헤더 행 */}
        <div
          ref={headerRowRef}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          {/* 서비스명 아일랜드 */}
          <div
            ref={titleIslandRef}
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              borderRadius: "14px",
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 800, color: "#111" }}>
              {T.appTitle}
            </span>
            <a
              href="https://www.instagram.com/_yoonyoon_1/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#0066ff",
                background: "rgba(0,102,255,0.08)",
                border: "1px solid rgba(0,102,255,0.2)",
                borderRadius: "8px",
                padding: "3px 8px",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {T.contact}
            </a>
          </div>

          {/* 언어 선택 아일랜드 */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setLangMenuOpen((v) => !v)}
              title="언어 선택 / Language"
              style={{
                fontSize: "20px",
                lineHeight: 1,
                padding: "7px 10px",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                borderRadius: "14px",
                cursor: "pointer",
              }}
            >
              {LANG_LABELS[lang]}
            </button>
            {langMenuOpen && (
              <>
                {/* 닫기 오버레이 */}
                <div
                  onClick={() => setLangMenuOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 150,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    zIndex: 151,
                    background: "rgba(255,255,255,0.97)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    border: "1px solid rgba(255,255,255,0.6)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {LANGS.map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLang(l as Lang);
                        setLangMenuOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "9px 16px",
                        background:
                          l === lang ? "rgba(0,102,255,0.08)" : "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: l === lang ? 700 : 400,
                        color: l === lang ? "#0066ff" : "#333",
                        whiteSpace: "nowrap",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>{LANG_LABELS[l]}</span>
                      <span>
                        {l === "ko"
                          ? "한국어"
                          : l === "en"
                            ? "English"
                            : l === "zh"
                              ? "中文"
                              : l === "ja"
                                ? "日本語"
                                : "Tiếng Việt"}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 스낵바 — 헤더 행 너비로 제한 */}
        {showHint1 && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              borderRadius: "12px",
              padding: "10px 16px",
              color: "white",
              fontSize: "clamp(13px, 1.8vw, 18px)",
              fontWeight: 400,
              whiteSpace: "normal",
              wordBreak: "keep-all",
              width: snackbarWidth,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                minWidth: 0,
              }}
            >
              <span
                style={{ fontSize: "clamp(16px, 2vw, 22px)", flexShrink: 0 }}
              >
                ⚠️
              </span>
              <span
                style={{
                  whiteSpace: "normal",
                  wordBreak:
                    lang === "ja" || lang === "zh" ? "break-all" : "keep-all",
                  overflowWrap: "break-word",
                }}
              >
                {T.hintPin}
              </span>
            </div>
            <button
              onClick={() => setShowHint1(false)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.7)",
                fontSize: "16px",
                cursor: "pointer",
                lineHeight: 1,
                padding: "0",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 하단 랜덤 버튼 + 칩 필터 바 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          pointerEvents: "none",
          paddingBottom: "0",
        }}
      >
        {/* 랜덤 버튼 */}
        <button
          onClick={handleRoll}
          disabled={filteredList.length === 0}
          style={{
            padding: "10px 22px",
            background:
              filteredList.length === 0 ? "rgba(200,200,200,0.6)" : "#0066ff",
            color: filteredList.length === 0 ? "#aaa" : "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: filteredList.length === 0 ? "not-allowed" : "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3px",
            pointerEvents: "auto",
          }}
        >
          <span>{T.roll}</span>
          <span style={{ fontSize: "12px", fontWeight: 500, opacity: 0.85 }}>
            {T.filterApplied}
          </span>
        </button>

        {/* 필터 칩 영역 — 흰색 배경 + 상단 그라데이션 */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            paddingTop: "3rem",
            paddingBottom: "2rem",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 3rem)",
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
                gap: "8px",
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
                    onClick={() => toggleFilterDirect("cat", item.key)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      border: isActive
                        ? "1px solid rgba(0,102,255,0.2)"
                        : "1.5px solid #d1d5db",
                      background: isActive ? "rgba(0,102,255,0.08)" : "white",
                      color: isActive ? "#0066ff" : "#333",
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
                gap: "8px",
                padding: "0 16px",
                width: "max-content",
              }}
            >
              {[
                { key: "👤 혼밥", label: T.tagSolo },
                { key: "💸 저렴이", label: T.tagCheap },
                { key: "💪 고단백", label: T.tagProtein },
                { key: "🥗 건강식", label: T.tagHealthy },
              ].map((item) => {
                const isActive = filters.tags.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => toggleFilterDirect("tags", item.key)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      border: isActive
                        ? "1px solid rgba(0,102,255,0.2)"
                        : "1.5px solid #d1d5db",
                      background: isActive ? "rgba(0,102,255,0.08)" : "white",
                      color: isActive ? "#0066ff" : "#333",
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
        {/* 필터 칩 영역 래퍼 끝 */}
      </div>

      {/* 복사 스낵바 */}
      <style>{`
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(4px); }
        }
        @keyframes snackSlideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes snackFadeOut {
          0%   { opacity: 1; max-height: 60px; margin-bottom: 0px; padding-top: 10px; padding-bottom: 10px; }
          60%  { opacity: 0; max-height: 60px; margin-bottom: 0px; padding-top: 10px; padding-bottom: 10px; }
          100% { opacity: 0; max-height: 0px;  margin-bottom: -6px; padding-top: 0px; padding-bottom: 0px; }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          top: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 202,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          pointerEvents: "none",
        }}
      >
        {copyToasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              borderRadius: "12px",
              padding: "10px 16px",
              color: "white",
              fontSize: "13px",
              fontWeight: 400,
              whiteSpace: "nowrap",
              overflow: "hidden",
              animation: toast.fading
                ? "snackFadeOut 0.4s ease forwards"
                : "snackSlideDown 0.3s ease forwards",
            }}
          >
            <span style={{ fontSize: "16px" }}>✅</span>
            <span>{toast.text}</span>
          </div>
        ))}
      </div>

      {/* 가게 정보 모달 */}
      {selectedRestaurant && (
        <>
          <div
            onClick={() => setSelectedRestaurant(null)}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 200,
              background: "rgba(0,0,0,0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 201,
              width: "calc(100% - 2rem)",
              maxWidth: "400px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "24px",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            {/* 상단 고정 헤더 */}
            <div
              style={{
                padding: "20px 20px 12px 20px",
                display: "flex",
                alignItems: "stretch",
                gap: "8px",
                borderBottom: "1px solid #eee",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    background: "#f5f5f5",
                    borderRadius: "12px",
                    padding: "0 14px",
                    height: "40px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "6px",
                  }}
                >
                  <div
                    style={{ fontSize: "16px", fontWeight: 800, color: "#111" }}
                  >
                    {selectedRestaurant.name}
                  </div>
                  <button
                    onClick={() =>
                      showCopyToast(
                        selectedRestaurant.name,
                        selectedRestaurant.name,
                      )
                    }
                    style={{
                      flexShrink: 0,
                      background: "#e0e0e0",
                      border: "none",
                      borderRadius: "8px",
                      padding: "5px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#444",
                      cursor: "pointer",
                    }}
                  >
                    {T.copy}
                  </button>
                </div>
                <span
                  style={{
                    background: "#e0e0e0",
                    color: "#444",
                    fontSize: "11px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    padding: "2px 8px",
                  }}
                >
                  {translateLabel(selectedRestaurant.category)}
                </span>
              </div>
              <button
                onClick={() => setSelectedRestaurant(null)}
                style={{
                  background: "#f5f5f5",
                  border: "none",
                  borderRadius: "12px",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  color: "#555",
                  fontSize: "16px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "flex-start",
                }}
              >
                ✕
              </button>
            </div>

            {/* 스크롤 영역 */}
            <div
              ref={modalScrollRef}
              onScroll={handleModalScroll}
              style={{
                overflowY: "auto",
                padding: "16px 20px 48px 20px",
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* 필터 태그 */}
              {(selectedRestaurant.filters.isCheap ||
                selectedRestaurant.filters.isHighProtein ||
                selectedRestaurant.filters.isHealthy ||
                selectedRestaurant.solo) && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "5px",
                    marginBottom: "12px",
                  }}
                >
                  {selectedRestaurant.solo && (
                    <span
                      style={{
                        background: "#f0f0f0",
                        color: "#444",
                        fontSize: "11px",
                        fontWeight: 700,
                        borderRadius: "8px",
                        padding: "3px 9px",
                      }}
                    >
                      {T.tagSoloLabel}
                    </span>
                  )}
                  {selectedRestaurant.filters.isCheap && (
                    <span
                      style={{
                        background: "#f0f0f0",
                        color: "#444",
                        fontSize: "11px",
                        fontWeight: 700,
                        borderRadius: "8px",
                        padding: "3px 9px",
                      }}
                    >
                      {T.tagCheapLabel}
                    </span>
                  )}
                  {selectedRestaurant.filters.isHighProtein && (
                    <span
                      style={{
                        background: "#f0f0f0",
                        color: "#444",
                        fontSize: "11px",
                        fontWeight: 700,
                        borderRadius: "8px",
                        padding: "3px 9px",
                      }}
                    >
                      {T.tagProteinLabel}
                    </span>
                  )}
                  {selectedRestaurant.filters.isHealthy && (
                    <span
                      style={{
                        background: "#f0f0f0",
                        color: "#444",
                        fontSize: "11px",
                        fontWeight: 700,
                        borderRadius: "8px",
                        padding: "3px 9px",
                      }}
                    >
                      {T.tagHealthyLabel}
                    </span>
                  )}
                </div>
              )}

              {/* 최저가 */}
              {selectedRestaurant.minPrice != null && (
                <div
                  style={{
                    background: "#f5f5f5",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{ fontSize: "12px", fontWeight: 600, color: "#888" }}
                  >
                    {T.minPrice}
                  </span>
                  <span
                    style={{ fontSize: "16px", fontWeight: 800, color: "#111" }}
                  >
                    {selectedRestaurant.minPrice.toLocaleString()}
                    {T.priceUnit}
                  </span>
                </div>
              )}

              {/* 메뉴 목록 */}
              {selectedRestaurant.menus.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#333",
                      marginBottom: "8px",
                    }}
                  >
                    {T.menu}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {selectedRestaurant.menus.map((menu) => (
                      <div
                        key={menu.menuId}
                        style={{
                          background: "#f5f5f5",
                          borderRadius: "10px",
                          padding: "9px 12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          border: menu.isPrimary
                            ? "1.5px solid #ccc"
                            : "1px solid transparent",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: menu.isPrimary ? 700 : 500,
                              color: "#111",
                            }}
                          >
                            {menuName(menu.name)}
                          </span>
                          {menu.isPrimary && (
                            <span
                              style={{
                                marginLeft: "6px",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "#555",
                                background: "#e0e0e0",
                                borderRadius: "5px",
                                padding: "1px 5px",
                              }}
                            >
                              {T.representative}
                            </span>
                          )}
                          {menu.tags && menu.tags.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                gap: "4px",
                                marginTop: "3px",
                                flexWrap: "wrap",
                              }}
                            >
                              {menu.tags.map((tag) => (
                                <span
                                  key={tag}
                                  style={{
                                    fontSize: "10px",
                                    color: "#888",
                                    background: "#e8e8e8",
                                    borderRadius: "5px",
                                    padding: "1px 5px",
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {menu.price != null && (
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#111",
                              whiteSpace: "nowrap",
                              marginLeft: "10px",
                            }}
                          >
                            {menu.price.toLocaleString()}
                            {T.priceUnitPlain}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* 스크롤 영역 끝 */}

            {/* 하단 고정 영역: 주소 + 네이버지도 버튼 */}
            <div
              style={{ padding: "12px 24px 24px 24px", position: "relative" }}
            >
              {/* 상단 페이드 오버레이 */}
              <div
                style={{
                  position: "absolute",
                  top: "-80px",
                  left: 0,
                  right: 0,
                  height: "80px",
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: "6px",
                }}
              >
                {!isScrolledToBottom && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "2px",
                      animation: "scrollBounce 1.2s ease-in-out infinite",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#888",
                      }}
                    >
                      {T.moreMenu}
                    </span>
                    <span style={{ fontSize: "14px", opacity: 0.6 }}>↓</span>
                  </div>
                )}
              </div>
              {/* 주소 */}
              <div
                style={{
                  background: "#f5f5f5",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  fontSize: "12px",
                  color: "#555",
                  lineHeight: 1.6,
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#333",
                      marginBottom: "2px",
                    }}
                  >
                    {T.address}
                  </div>
                  <div>{selectedRestaurant.roadAddress}</div>
                </div>
                <button
                  onClick={() =>
                    showCopyToast(
                      selectedRestaurant.roadAddress,
                      selectedRestaurant.roadAddress,
                    )
                  }
                  style={{
                    flexShrink: 0,
                    background: "#e0e0e0",
                    border: "none",
                    borderRadius: "8px",
                    padding: "5px 10px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#444",
                    cursor: "pointer",
                  }}
                >
                  {T.copy}
                </button>
              </div>

              {/* 네이버지도 버튼 */}
              <a
                href={`https://map.naver.com/p/entry/place/${selectedRestaurant.naverMapCode}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "13px 0",
                  background: "#03C75A",
                  color: "white",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                {T.naverMap}
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
