/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo, useRef, useCallback } from "react";
import type { Restaurant } from "../data2";
import { restaurants } from "../data2";
import { FilterPanel } from "./FilterPanel";
import NaverMap from "./NaverMap";
import filterIcon from "../assets/filter.png";

export default function MapSelector() {
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
  const [picked, setPicked] = useState<Restaurant[]>([]);
  const [hasRolled, setHasRolled] = useState(true);
  const [mapDisplayList, setMapDisplayList] =
    useState<Restaurant[]>(restaurants);
  const [cardDisplayList, setCardDisplayList] =
    useState<Restaurant[]>(restaurants);
  const [filterOpen, setFilterOpen] = useState(false);
  const [focusTarget, setFocusTarget] = useState<Restaurant | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  // 모달 적용 버튼을 눌렀을 때 확정되는 필터 라벨
  const [appliedLabels, setAppliedLabels] = useState<string[]>(["전체"]);
  const [showHint1, setShowHint1] = useState(true);
  const [copyToasts, setCopyToasts] = useState<
    { id: number; text: string; fading: boolean }[]
  >([]);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const scrollHintEnabledRef = useRef(false);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);

  const handleModalScroll = useCallback(() => {
    if (!scrollHintEnabledRef.current) return;
    const el = modalScrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    setIsScrolledToBottom(atBottom);
  }, []);
  // 모달 내부에서만 쓰는 임시 필터 (적용 전까지 홈에 반영 안 됨)
  const [draftFilters, setDraftFilters] = useState<{
    type: string[];
    cat: string[];
    zone: string[];
    tags: string[];
  }>({ type: [], cat: ["전체"], zone: [], tags: [] });

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
      { id, text: `"${label}" 복사됨`, fading: false },
    ]);
    setTimeout(
      () =>
        setCopyToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, fading: true } : t)),
        ),
      1600,
    );
    setTimeout(
      () => setCopyToasts((prev) => prev.filter((t) => t.id !== id)),
      2000,
    );
  };

  // ── 필터링 로직 (확정된 filters 기준) ──
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

  // 모달 미리보기용 필터링 (draftFilters 기준)
  const draftFilteredList = useMemo<Restaurant[]>(() => {
    return restaurants.filter((r) => {
      const typeOk =
        draftFilters.type.length === 0 || draftFilters.type.includes(r.type);
      const catOk =
        draftFilters.cat.includes("전체") ||
        draftFilters.cat.includes(r.category);
      const zoneOk =
        draftFilters.zone.length === 0 || draftFilters.zone.includes(r.zone);
      const tagsOk = applyTagFilter(r, draftFilters.tags);
      return typeOk && catOk && zoneOk && tagsOk;
    });
  }, [draftFilters]);

  // ── 모달 열기 (현재 확정 필터를 draft로 복사) ──
  const openFilter = () => {
    setDraftFilters(filters);
    setFilterOpen(true);
  };

  // ── 모달 내 필터 토글 핸들러 (draft만 변경) ──
  const toggleFilter = (
    key: "type" | "cat" | "zone" | "tags",
    value: string,
  ) => {
    setDraftFilters((prev) => {
      if (key === "cat" && value === "전체") {
        return { ...prev, [key]: prev[key].includes("전체") ? [] : ["전체"] };
      }
      if (key === "cat" && value !== "전체") {
        const newCat = prev[key].includes(value)
          ? prev[key].filter((v) => v !== value)
          : [...prev[key].filter((v) => v !== "전체"), value];
        return { ...prev, [key]: newCat };
      }
      return {
        ...prev,
        [key]: prev[key].includes(value)
          ? prev[key].filter((v) => v !== value)
          : [...prev[key], value],
      };
    });
  };

  // ── 필터 초기화 (draft만) ──
  const resetFilters = () => {
    setDraftFilters({ type: [], cat: ["전체"], zone: [], tags: [] });
  };

  // ── 랜덤 선택 ──
  const handleRoll = () => {
    const shuffled = [...filteredList].sort(() => 0.5 - Math.random());
    const result = shuffled.slice(0, 1);
    setPicked(result);
    setMapDisplayList(result);
    setCardDisplayList(result);
    setHasRolled(true);
    setFocusTarget(result[0] ?? null);
  };

  // ── 전체 조회 ──
  const handleViewAll = () => {
    setPicked(filteredList);
    setMapDisplayList(filteredList);
    setCardDisplayList(filteredList);
    setHasRolled(true);
  };

  // 활성 필터 수 (확정된 filters 기준, 홈 뱃지용)
  const activeFilterCount =
    (filters.cat.includes("전체") || filters.cat.length === 0
      ? 0
      : filters.cat.length) + filters.tags.length;

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

      {/* 상단 안내 스낵바 */}
      {showHint1 && (
        <div
          style={{
            position: "absolute",
            top: "4.5rem",
            left: "1rem",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {showHint1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderRadius: "12px",
                padding: "10px 16px",
                color: "white",
                fontSize: "clamp(13px, 1.8vw, 18px)",
                fontWeight: 400,
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span style={{ fontSize: "clamp(16px, 2vw, 22px)" }}>⚠️</span>
                <span>핀이 겹치면 지도를 확대하세요</span>
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
      )}

      {/* 상단 헤더 */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "6px",
        }}
      >
        <div
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
            뭐먹지 명지대
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
            문의하기
          </a>
        </div>
      </div>

      {/* 우상단 필터 아이콘 + 적용된 필터 */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "6px",
        }}
      >
        <button
          onClick={openFilter}
          style={{
            position: "relative",
            width: "56px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            padding: "10px 0",
          }}
        >
          <img src={filterIcon} style={{ width: "22px", height: "22px" }} />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#333" }}>
            필터
          </span>
          {activeFilterCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#0066ff",
                color: "white",
                fontSize: "10px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* 적용된 필터 */}
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "14px",
            padding: "8px 12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#888" }}>
            적용된 필터
          </span>
          {(() => {
            const tagSet = new Set([
              "👤 혼밥",
              "💸 저렴이",
              "💪 고단백",
              "🥗 건강식",
            ]);
            const catLabels = appliedLabels.filter((l) => !tagSet.has(l));
            const tagLabels = appliedLabels.filter((l) => tagSet.has(l));
            return (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    alignItems: "flex-end",
                  }}
                >
                  {catLabels.map((label) => (
                    <span
                      key={label}
                      style={{
                        background: "#0066ff",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "20px",
                        padding: "4px 10px",
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                {catLabels.length > 0 && tagLabels.length > 0 && (
                  <div
                    style={{
                      width: "100%",
                      height: "1px",
                      background: "rgba(0,0,0,0.1)",
                    }}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    alignItems: "flex-end",
                  }}
                >
                  {tagLabels.map((label) => (
                    <span
                      key={label}
                      style={{
                        background: "#0066ff",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "20px",
                        padding: "4px 10px",
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* 하단 랜덤 / 전체 보기 버튼 */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
        }}
      >
        <button
          onClick={handleRoll}
          disabled={filteredList.length === 0}
          style={{
            padding: "14px 28px",
            background:
              filteredList.length === 0 ? "rgba(200,200,200,0.6)" : "#0066ff",
            color: filteredList.length === 0 ? "#aaa" : "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: filteredList.length === 0 ? "not-allowed" : "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3px",
          }}
        >
          <span>🎲 1개 뽑기</span>
          <span style={{ fontSize: "12px", fontWeight: 500, opacity: 0.85 }}>
            필터 적용됨
          </span>
        </button>
      </div>

      {/* 필터 모달 */}
      {filterOpen && (
        <>
          {/* 딤 배경 */}
          <div
            onClick={() => setFilterOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 200,
              background: "rgba(0,0,0,0.35)",
            }}
          />

          {/* 모달 본체 */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 201,
              width: "calc(100% - 2rem)",
              maxWidth: "420px",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "24px",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
              padding: "24px",
            }}
          >
            {/* 모달 헤더 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <span
                style={{ fontSize: "17px", fontWeight: 700, color: "#111" }}
              >
                필터
              </span>
              <button
                onClick={() => setFilterOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#555",
                  lineHeight: 1,
                  padding: "2px 6px",
                }}
              >
                ✕
              </button>
            </div>

            <FilterPanel
              filters={draftFilters}
              onToggleFilter={toggleFilter}
              onReset={resetFilters}
            />

            {/* 초기화 + 적용 */}
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={resetFilters}
                style={{
                  flex: 1,
                  padding: "13px 0",
                  background: "rgba(240,240,240,0.8)",
                  color: "#555",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                초기화
              </button>
              <button
                onClick={() => {
                  setFilters(draftFilters);
                  const labels =
                    draftFilters.cat.includes("전체") ||
                    draftFilters.cat.length === 0
                      ? ["전체", ...draftFilters.tags]
                      : [...draftFilters.cat, ...draftFilters.tags];
                  setAppliedLabels(labels);
                  setMapDisplayList(draftFilteredList);
                  setCardDisplayList(draftFilteredList);
                  setHasRolled(true);
                  setPicked([]);
                  setFilterOpen(false);
                }}
                disabled={draftFilteredList.length === 0}
                style={{
                  flex: 2,
                  padding: "13px 0",
                  background:
                    draftFilteredList.length === 0
                      ? "rgba(200,200,200,0.6)"
                      : "#0066ff",
                  color: draftFilteredList.length === 0 ? "#aaa" : "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor:
                    draftFilteredList.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                적용 ({draftFilteredList.length}개)
              </button>
            </div>
          </div>
        </>
      )}

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
                    복사
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
                  {selectedRestaurant.category}
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
                      👤 혼밥 가능
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
                      💸 저렴이
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
                      💪 고단백
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
                      🥗 건강식
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
                    최저가
                  </span>
                  <span
                    style={{ fontSize: "16px", fontWeight: 800, color: "#111" }}
                  >
                    {selectedRestaurant.minPrice.toLocaleString()}원~
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
                    메뉴
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
                            {menu.name.ko}
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
                              대표
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
                            {menu.price.toLocaleString()}원
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
                      메뉴가 더 있어요
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
                    주소
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
                  복사
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
                네이버지도에서 보기
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
