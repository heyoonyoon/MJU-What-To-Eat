import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import type { Restaurant } from "../data2";
import { restaurants } from "../data2";
import NaverMap from "./NaverMap";
import type { MarkerModeKey, MarkerModes } from "./NaverMap";
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
  const [showHint1, setShowHint1] = useState(false);
  const [copyToasts, setCopyToasts] = useState<
    { id: number; text: string; fading: boolean }[]
  >([]);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // 실제 적용된 검색어
  const [searchInput, setSearchInput] = useState(""); // 모달 내 입력 중인 값
  const [searchTarget, setSearchTarget] = useState<"name" | "menu">("menu");
  const [appliedTarget, setAppliedTarget] = useState<"name" | "menu">("menu");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const searchModalRef = useRef<HTMLDivElement | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);
  const dragLastY = useRef<number>(0);
  const dragLastTime = useRef<number>(0);
  const dragVelocity = useRef<number>(0);
  const searchLockRef = useRef(false);

  const closeSearchModal = useCallback(() => {
    const el = searchModalRef.current;
    if (!el) {
      setSearchModalOpen(false);
      return;
    }
    el.style.transition = "transform 0.12s ease, opacity 0.1s ease";
    el.style.transform = "translateY(-16px)";
    el.style.opacity = "0";
    setTimeout(() => setSearchModalOpen(false), 120);
  }, []);

  const dragStartX = useRef<number>(0);
  const dragCurrentX = useRef<number>(0);

  // Y축: 일반 저항 / X축: 강한 저항 (살짝만 움직임)
  const resistY = (delta: number) => {
    const sign = delta < 0 ? -1 : 1;
    return sign * Math.pow(Math.abs(delta), 0.65) * 2.2;
  };
  const resistX = (delta: number) => {
    const sign = delta < 0 ? -1 : 1;
    return sign * Math.pow(Math.abs(delta), 0.4) * 1.2;
  };

  const onDragStart = (clientX: number, clientY: number) => {
    const el = searchModalRef.current;
    if (el) {
      el.style.animation = "none";
      el.style.transition = "none";
      el.style.transform = "translateY(0)";
      el.style.opacity = "1";
    }
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    dragCurrentX.current = 0;
    dragCurrentY.current = 0;
    dragLastY.current = clientY;
    dragLastTime.current = Date.now();
    dragVelocity.current = 0;
  };

  const onDragMove = (clientX: number, clientY: number) => {
    if (dragStartY.current === null) return;
    const now = Date.now();
    const dt = now - dragLastTime.current;
    if (dt > 0) {
      dragVelocity.current = (clientY - dragLastY.current) / dt;
    }
    dragLastY.current = clientY;
    dragLastTime.current = now;

    const deltaY = clientY - dragStartY.current;
    const deltaX = clientX - dragStartX.current;
    dragCurrentY.current = deltaY;
    dragCurrentX.current = deltaX;

    if (searchModalRef.current) {
      const ty = resistY(deltaY);
      const tx = resistX(deltaX);
      searchModalRef.current.style.transform = `translateX(${tx}px) translateY(${ty}px)`;
      searchModalRef.current.style.opacity = String(
        Math.max(0, 1 - Math.abs(ty) / 180),
      );
    }
  };

  const onDragEnd = () => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;

    const velocity = dragVelocity.current; // px/ms
    const delta = dragCurrentY.current;
    const VELOCITY_THRESHOLD = 0.5; // px/ms 이상이면 빠른 드래그로 판단
    const DISTANCE_THRESHOLD = 80;

    const shouldDismiss =
      Math.abs(velocity) > VELOCITY_THRESHOLD ||
      Math.abs(delta) > DISTANCE_THRESHOLD;

    if (shouldDismiss) {
      // 드래그 방향으로 날아가며 닫기
      const direction = delta >= 0 ? 1 : -1;
      const el = searchModalRef.current;
      if (el) {
        el.style.transition = "transform 0.12s ease, opacity 0.1s ease";
        el.style.transform = `translateY(${direction * 120}px)`;
        el.style.opacity = "0";
      }
      setTimeout(() => setSearchModalOpen(false), 120);
    } else {
      // 제자리로 스프링 복귀 (X, Y 모두)
      if (searchModalRef.current) {
        searchModalRef.current.style.transition =
          "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease";
        searchModalRef.current.style.transform = "translateX(0) translateY(0)";
        searchModalRef.current.style.opacity = "1";
      }
    }
  };
  const [markerModes, setMarkerModes] = useState<MarkerModes>(
    new Set(["price"]),
  );

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

  const applySearch = useCallback(
    (query: string, target: "name" | "menu"): number => {
      const q = query.trim().toLowerCase();
      const matched = q
        ? restaurants.filter((r) => {
            const typeOk =
              filters.type.length === 0 || filters.type.includes(r.type);
            const catOk =
              filters.cat.includes("전체") || filters.cat.includes(r.category);
            const zoneOk =
              filters.zone.length === 0 || filters.zone.includes(r.zone);
            const tagsOk = applyTagFilter(r, filters.tags);
            if (!typeOk || !catOk || !zoneOk || !tagsOk) return false;
            if (target === "name") return r.name.toLowerCase().includes(q);
            return r.menus.some((m) =>
              Object.values(m.name).some((v) => v.toLowerCase().includes(q)),
            );
          })
        : restaurants;

      setSearchQuery(query);
      setAppliedTarget(target);
      if (query) {
        const modeKey: MarkerModeKey = target === "menu" ? "menu" : "name";
        setMarkerModes((prev) => {
          if (prev.has(modeKey)) return prev;
          return new Set([...prev, modeKey]);
        });
        if (matched.length > 0) {
          setFocusTarget(matched[0]);
        }
      }
      return matched.length;
    },
    [filters],
  );

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const scrollHintEnabledRef = useRef(false);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);
  const headerRowRef = useRef<HTMLDivElement | null>(null);
  const titleIslandRef = useRef<HTMLDivElement | null>(null);

  const handleModalScroll = useCallback(() => {
    if (!scrollHintEnabledRef.current) return;
    const el = modalScrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    setIsScrolledToBottom(atBottom);
  }, []);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setCopyToasts((prev) => [...prev, { id, text: message, fading: false }]);
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
  }, []);

  const showCopyToast = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`"${label}" ${T.copied}`);
  };

  const filteredList = useMemo<Restaurant[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    return restaurants.filter((r) => {
      const typeOk = filters.type.length === 0 || filters.type.includes(r.type);
      const catOk =
        filters.cat.includes("전체") || filters.cat.includes(r.category);
      const zoneOk = filters.zone.length === 0 || filters.zone.includes(r.zone);
      const tagsOk = applyTagFilter(r, filters.tags);
      if (!typeOk || !catOk || !zoneOk || !tagsOk) return false;
      if (!q) return true;
      if (appliedTarget === "name") return r.name.toLowerCase().includes(q);
      return r.menus.some((m) =>
        Object.values(m.name).some((v) => v.toLowerCase().includes(q)),
      );
    });
  }, [filters, searchQuery, appliedTarget]);

  // 검색어/필터 변경시 지도 핀 즉시 업데이트
  useEffect(() => {
    setMapDisplayList(filteredList);
  }, [filteredList]);

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
        markerModes={markerModes}
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
          right: "1rem",
          zIndex: 160,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "6px",
        }}
      >
        {/* 첫 번째 행: 검색바 + 언어아이콘 */}
        <div
          ref={headerRowRef}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            width: "100%",
          }}
        >
          {/* 검색바 (클릭 시 모달 오픈) */}
          <button
            onClick={() => {
              setSearchInput(searchQuery);
              setSearchModalOpen(true);
            }}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              borderRadius: "14px",
              padding: "0 14px",
              height: "40px",
              cursor: "text",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: "15px", opacity: 0.5, flexShrink: 0 }}>
              🔍
            </span>
            <span
              style={{
                flex: 1,
                fontSize: "14px",
                fontWeight: 500,
                color: searchQuery ? "#111" : "#aaa",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {searchQuery || T.searchPlaceholder}
            </span>
            {searchQuery && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                  setSearchInput("");
                }}
                style={{
                  fontSize: "14px",
                  color: "#aaa",
                  flexShrink: 0,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                ✕
              </span>
            )}
          </button>

          {/* 언어 선택 아이콘 */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setLangMenuOpen((v) => !v)}
              title="언어 선택 / Language"
              style={{
                fontSize: "20px",
                lineHeight: 1,
                padding: "7px 10px",
                height: "40px",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                borderRadius: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
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
                    right: 0,
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

        {/* 두 번째 행: 서비스명 아일랜드 + 마커 표시 모드 토글 */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            gap: "8px",
            width: "100%",
          }}
        >
          {/* 서비스명 아일랜드 — 공간 부족 시 줄바꿈 */}
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
              flex: 1,
              minWidth: 0,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: lang === "ko" ? "15px" : "11px",
                fontWeight: 800,
                color: "#111",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
            >
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

          {/* 마커 표시 모드 토글 — 오른쪽 고정 */}
          <div
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderRadius: "16px",
              padding: "10px 14px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              flexShrink: 0,
              marginLeft: "auto",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#888",
                letterSpacing: "0.3px",
                textTransform: "uppercase",
              }}
            >
              {T.markerLabel}
            </span>
            <div style={{ display: "flex", flexDirection: "row", gap: "6px" }}>
              {(["price", "menu", "name"] as MarkerModeKey[]).map((mode) => {
                const base =
                  mode === "price"
                    ? T.markerPrice
                    : mode === "menu"
                      ? T.markerMenu
                      : T.markerName;
                const suffix = T.markerSuffix ? ` ${T.markerSuffix}` : "";
                const label = base + suffix;
                const isActive = markerModes.has(mode);
                const isDisabled = isActive && markerModes.size === 1;
                return (
                  <button
                    key={mode}
                    disabled={isDisabled}
                    onClick={() => {
                      setMarkerModes((prev) => {
                        const next = new Set(prev);
                        if (next.has(mode)) {
                          next.delete(mode);
                        } else {
                          next.add(mode);
                        }
                        return next;
                      });
                    }}
                    style={{
                      padding: "6px 13px",
                      borderRadius: "999px",
                      border: isActive
                        ? "1.5px solid #0066ff"
                        : "1.5px solid #e0e0e0",
                      background: isActive ? "#0066ff" : "white",
                      color: isActive ? "white" : "#555",
                      fontSize: "12px",
                      fontWeight: isActive ? 700 : 500,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease",
                      opacity: isDisabled ? 0.45 : 1,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
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
              width: "100%",
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
          gap: "0",
          pointerEvents: "none",
          paddingBottom: "0",
        }}
      >
        {/* 필터 칩 영역 — 흰색 배경 + 상단 그라데이션 + 뽑기 버튼 */}
        <div
          style={{
            position: "relative",
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
          {/* 랜덤 버튼 — 그라데이션 위에 띄움 */}
          <button
            onClick={handleRoll}
            disabled={filteredList.length === 0}
            style={{
              position: "absolute",
              top: "0",
              left: "50%",
              transform: "translate(-50%, -50%)",
              padding: "8px 18px",
              background:
                filteredList.length === 0 ? "rgba(200,200,200,0.6)" : "#0066ff",
              color: filteredList.length === 0 ? "#aaa" : "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: filteredList.length === 0 ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              pointerEvents: "auto",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            <span>{T.roll}</span>
            <span style={{ fontSize: "12px", fontWeight: 500, opacity: 0.85 }}>
              {T.filterApplied}
            </span>
          </button>
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
        @keyframes searchModalSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes searchModalSlideUp {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-24px); }
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

      {/* 검색 모달 */}
      {searchModalOpen && (
        <>
          <div
            onClick={closeSearchModal}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 200,
              background: "rgba(0,0,0,0.25)",
            }}
          />
          <div
            ref={searchModalRef}
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              right: "1rem",
              zIndex: 201,
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              padding: "12px 16px 16px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              animation: "searchModalSlideDown 0.22s ease forwards",
              touchAction: "none",
            }}
            onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
            onMouseMove={(e) => {
              if (dragStartY.current !== null) onDragMove(e.clientX, e.clientY);
            }}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            onTouchStart={(e) =>
              onDragStart(e.touches[0].clientX, e.touches[0].clientY)
            }
            onTouchMove={(e) =>
              onDragMove(e.touches[0].clientX, e.touches[0].clientY)
            }
            onTouchEnd={onDragEnd}
          >
            {/* 상단 인디케이터 */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                cursor: "grab",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "4px",
                  borderRadius: "999px",
                  background: "#d1d5db",
                }}
              />
            </div>

            {/* 검색 input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#f5f5f5",
                borderRadius: "14px",
                padding: "0 14px",
                height: "44px",
              }}
            >
              <span style={{ fontSize: "15px", opacity: 0.45, flexShrink: 0 }}>
                🔍
              </span>
              <input
                ref={searchInputRef}
                type="text"
                enterKeyHint="search"
                inputMode="search"
                autoFocus
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (searchLockRef.current) return;
                    searchLockRef.current = true;
                    setTimeout(() => {
                      searchLockRef.current = false;
                    }, 300);
                    const count = applySearch(searchInput, searchTarget);
                    if (count > 0) closeSearchModal();
                    else showToast(T.searchNoResult);
                  }
                }}
                placeholder={T.searchModalPlaceholder}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#111",
                  minWidth: 0,
                }}
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    searchInputRef.current?.focus();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0",
                    fontSize: "14px",
                    color: "#aaa",
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* 가게명 / 메뉴명 선택 */}
            <div style={{ display: "flex", gap: "8px" }}>
              {(["menu", "name"] as const).map((target) => {
                const label =
                  target === "name" ? T.searchByName : T.searchByMenu;
                const isActive = searchTarget === target;
                return (
                  <button
                    key={target}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setSearchTarget(target)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: "12px",
                      border: isActive
                        ? "1.5px solid #0066ff"
                        : "1.5px solid #e0e0e0",
                      background: isActive ? "rgba(0,102,255,0.07)" : "white",
                      color: isActive ? "#0066ff" : "#555",
                      fontSize: "14px",
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* 검색 버튼 */}
            <button
              type="button"
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              onClick={() => {
                if (searchLockRef.current) return;
                searchLockRef.current = true;
                setTimeout(() => {
                  searchLockRef.current = false;
                }, 300);
                const count = applySearch(searchInput, searchTarget);
                if (count > 0) closeSearchModal();
                else showToast(T.searchNoResult);
              }}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: "12px",
                border: "none",
                background: "#0066ff",
                color: "white",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {T.searchApply}
            </button>
          </div>
        </>
      )}

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
