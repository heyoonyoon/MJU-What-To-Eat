import { useState, useRef, useEffect, useCallback } from "react";
import NaverMap from "../NaverMap";
import type { MarkerModeKey, MarkerModes } from "../NaverMap";
import { useLang } from "../../LangContext";
import { t, LANG_LABELS, LANGS } from "../../i18n";
import type { Lang } from "../../i18n";
import type { Restaurant } from "../../types/restaurant";

import { useFilterState } from "./hooks/useFilterState";
import { useShopModal } from "./hooks/useShopModal";
import { useSearchModal } from "./hooks/useSearchModal";
import { useToast } from "./hooks/useToast";

import HeaderSection from "./components/HeaderSection";
import FilterBar from "./components/FilterBar";
import FilterSheet from "./components/FilterSheet";
import MenuView from "./components/MenuView";
import SearchModal from "./components/SearchModal";
import ShopDetailModal from "./components/ShopDetailModal";
import Confetti from "./components/Confetti";

const PRICE_MAX = 18000;

export default function MapSelector() {
  const { lang, setLang } = useLang();

  // --- 훅 ---
  const {
    filters,
    maxPrice,
    setMaxPrice,
    searchQuery,
    setSearchQuery,
    appliedTarget,
    filteredList,
    filteredMenuIds,
    toggleFilter,
    applyFilterSheet,
    applySearch,
    sortOrder,
    setSortOrder,
  } = useFilterState();

  const {
    selectedRestaurant,
    shopModalClosing,
    isScrolledToBottom,
    shopModalRef,
    modalScrollRef,
    closeShopModal,
    openShopModal,
    handleModalScroll,
    onShopDragStart,
    onScrollAreaTouchStart,
  } = useShopModal();

  const {
    searchModalOpen,
    setSearchModalOpen,
    searchInput,
    setSearchInput,
    searchTarget,
    setSearchTarget,
    searchModalRef,
    searchInputRef,
    searchLockRef,
    closeSearchModal,
    onDragStart: onSearchDragStart,
    onDragMove: onSearchDragMove,
    onDragEnd: onSearchDragEnd,
    isDragging: isSearchDragging,
  } = useSearchModal();

  const { toasts, showToast } = useToast();

  // --- 로컬 상태 ---
  const [focusTarget, setFocusTarget] = useState<Restaurant | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [rolledId, setRolledId] = useState<string | null>(null);
  const [rolledMenuKey, setRolledMenuKey] = useState<{
    restaurantId: string;
    menuId: string;
  } | null>(null);
  const [showHint1, setShowHint1] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [langMenuVisible, setLangMenuVisible] = useState(false);
  const [langMenuPos, setLangMenuPos] = useState<{ top: number; right: number }>({ top: 60, right: 16 });
  const [sliderValue, setSliderValue] = useState(PRICE_MAX);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [sortDropdownPos, setSortDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filterSheetClosing, setFilterSheetClosing] = useState(false);
  const [markerModes, setMarkerModes] = useState<MarkerModes>(
    new Set(["price"]),
  );
  const [activeTab, setActiveTab] = useState<"map" | "menu">("menu");
  const [markerIslandOpen, setMarkerIslandOpen] = useState(true);
  const [menuFilterBarHeight, setMenuFilterBarHeight] = useState(160);
  const [headerHeight, setHeaderHeight] = useState(70);
  const [isMenuScrolled, setIsMenuScrolled] = useState(false);

  // refs
  const langBtnRef = useRef<HTMLButtonElement | null>(null);
  const sortBtnRef = useRef<HTMLButtonElement | null>(null);
  const menuScrollRef = useRef<HTMLDivElement | null>(null);
  const headerRowRef = useRef<HTMLDivElement | null>(null);
  // 탭 전환 후 MenuView 재마운트 시 스크롤 위치 복원을 위한 ref
  const savedMenuScrollTop = useRef(0);
  // 탭 복원용 scroll 리스너 정리 ref
  const savedScrollListenerCleanup = useRef<(() => void) | null>(null);

  // 필터 변경 시 스크롤 리셋
  useEffect(() => {
    savedMenuScrollTop.current = 0;
    menuScrollRef.current?.scrollTo({ top: 0 });
  }, [filteredList]);

  // --- 핸들러 ---
  const openLangMenu = useCallback(() => {
    const rect = langBtnRef.current?.getBoundingClientRect();
    if (rect) {
      setLangMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
    setLangMenuOpen(true);
    requestAnimationFrame(() => setLangMenuVisible(true));
  }, []);

  const closeLangMenu = useCallback(() => {
    setLangMenuVisible(false);
    setTimeout(() => setLangMenuOpen(false), 180);
  }, []);

  const openSortDropdown = useCallback(() => {
    const rect = sortBtnRef.current?.getBoundingClientRect();
    if (rect) setSortDropdownPos({ top: rect.bottom + 6, left: rect.left });
    setSortDropdownOpen(true);
    requestAnimationFrame(() => setSortDropdownVisible(true));
  }, []);

  const closeSortDropdown = useCallback(() => {
    setSortDropdownVisible(false);
    setTimeout(() => setSortDropdownOpen(false), 180);
  }, []);

  const openFilterSheet = useCallback(() => {
    setFilterSheetClosing(false);
    setFilterSheetOpen(true);
  }, []);

  const closeFilterSheet = useCallback(() => {
    setFilterSheetClosing(true);
    setTimeout(() => { setFilterSheetOpen(false); setFilterSheetClosing(false); }, 230);
  }, []);

  const handleClearPrice = useCallback(() => {
    setMaxPrice(null);
    setSliderValue(PRICE_MAX);
  }, [setMaxPrice]);

  const handleToggleMarkerMode = useCallback((mode: MarkerModeKey) => {
    setMarkerModes((prev) => {
      const next = new Set(prev);
      if (next.has(mode)) {
        if (next.size === 1) return prev;
        next.delete(mode);
      } else {
        next.add(mode);
      }
      return next;
    });
  }, []);

  // rolledId가 현재 filteredList에 없으면 null로 취급 (파생 계산, useEffect 불필요)
  const rolledRestaurant =
    rolledId !== null
      ? (filteredList.find((r) => r.id === rolledId) ?? null)
      : null;

  // 메뉴 뽑기: filteredList 내 모든 메뉴 중 1개를 뽑아 해당 가게만 표시
  const rolledMenuRestaurant =
    rolledMenuKey !== null
      ? (filteredList.find((r) => r.id === rolledMenuKey.restaurantId) ?? null)
      : null;

  // 메뉴판에 보여줄 뽑힌 메뉴 ID 세트
  const rolledMenuIdSet =
    rolledMenuKey !== null
      ? new Set([`${rolledMenuKey.restaurantId}-${rolledMenuKey.menuId}`])
      : null;

  const handleRoll = useCallback(() => {
    setRolledMenuKey(null);
    const idx = Math.floor(Math.random() * filteredList.length);
    const picked = filteredList[idx] ?? null;
    setRolledId(picked?.id ?? null);
    setFocusTarget(picked);
    setMarkerModes((prev) => prev.has("name") ? prev : new Set([...prev, "name"]));
    setConfettiTrigger((t) => t + 1);
  }, [filteredList]);

  const handleRollMenu = useCallback(() => {
    setRolledId(null);
    // filteredMenuIds가 있으면 그 안에서, null이면 filteredList 전체 메뉴에서 뽑기
    const allMenus = filteredList.flatMap((r) =>
      (r.menus || [])
        .filter(
          (m) =>
            filteredMenuIds === null ||
            filteredMenuIds.has(`${r.id}-${m.menuId}`),
        )
        .map((m) => ({ restaurantId: r.id, menuId: m.menuId, r })),
    );
    if (allMenus.length === 0) return;
    const picked = allMenus[Math.floor(Math.random() * allMenus.length)];
    setRolledMenuKey({
      restaurantId: picked.restaurantId,
      menuId: picked.menuId,
    });
    setFocusTarget(picked.r);
    setMarkerModes((prev) => prev.has("menu") ? prev : new Set([...prev, "menu"]));
    setConfettiTrigger((t) => t + 1);
  }, [filteredList, filteredMenuIds]);

  const handleUnroll = useCallback(() => {
    setRolledId(null);
    setRolledMenuKey(null);
  }, []);

  const handleApplySearch = useCallback(
    (input: string, target: "name" | "menu") => {
      const count = applySearch(input, target, setMarkerModes, setFocusTarget);
      if (count > 0) {
        closeSearchModal();
        setMarkerIslandOpen(false);
      } else {
        showToast("검색 결과가 없습니다");
      }
    },
    [applySearch, closeSearchModal, showToast],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchInput("");
  }, [setSearchQuery, setSearchInput]);

  const lastCopyRef = useRef(0);
  const showCopyToast = useCallback(
    (text: string, label: string) => {
      const now = Date.now();
      if (now - lastCopyRef.current < 500) return;
      lastCopyRef.current = now;
      const T = t[lang];
      const fallbackCopy = () => {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.top = "-9999px";
        el.style.left = "-9999px";
        el.style.opacity = "0";
        el.setAttribute("readonly", "");
        document.body.appendChild(el);
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        el.setSelectionRange(0, text.length);
        document.execCommand("copy");
        sel?.removeAllRanges();
        document.body.removeChild(el);
      };

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
      showToast(`"${label}" ${T.copied}`);
    },
    [lang, showToast],
  );



  return (
    <div style={{ position: "fixed", inset: 0 }}>
      {/* CSS 애니메이션 */}
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
        @keyframes shopModalSlideUp {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes filterSheetSlideDown {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(100%); }
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes overlayFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes rollBtnPress {
          0%   { background: rgba(0,0,0,0.03); color: #333; border-color: #d1d5db; }
          15%  { background: #0066ff; color: white; border-color: #0066ff; }
          100% { background: rgba(0,0,0,0.03); color: #333; border-color: #d1d5db; }
        }
        @keyframes menuViewFadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fabIconPop {
          0% { opacity: 0; transform: scale(0.85) translateY(6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .roll-btn-pressing {
          animation: rollBtnPress 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        @keyframes rollPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        .roll-pulse-active {
          animation: rollPulse 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes rollWinningPop {
          0% { transform: scale(0.94) translateY(10px); opacity: 0; }
          50% { transform: scale(1.03) translateY(-2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .roll-winning-anim {
          animation: rollWinningPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
          background-color: #ffffff !important;
          z-index: 10;
          position: relative;
        }
        .header-backdrop {
          position: absolute;
          top: 8px;
          left: 12px;
          right: 12px;
          border-radius: 24px;
          background: transparent;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border: 1px solid transparent;
          box-shadow: none;
          transition: background 0.35s ease, backdrop-filter 0.35s ease, -webkit-backdrop-filter 0.35s ease, border 0.35s ease, box-shadow 0.35s ease;
          pointer-events: none;
        }
        .header-backdrop.is-scrolled {
          background: linear-gradient(
            160deg,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(255, 255, 255, 0.2) 100%
          );
          backdrop-filter: blur(30px) saturate(200%) brightness(1.05);
          -webkit-backdrop-filter: blur(30px) saturate(200%) brightness(1.05);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }
      `}</style>

      {/* 지도 */}
      <NaverMap
        displayList={
          rolledRestaurant
            ? [rolledRestaurant]
            : rolledMenuRestaurant
              ? [rolledMenuRestaurant]
              : filteredList
        }
        focusTarget={focusTarget}
        markerModes={markerModes}
        onMarkerClick={openShopModal}
        filteredMenuIds={
          rolledRestaurant
            ? null
            : rolledMenuKey
              ? rolledMenuIdSet
              : filteredMenuIds
        }
      />

      {/* 상단 그라데이션 (스크롤 안 했을 때만) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "calc(env(safe-area-inset-top, 0px) + 80px)",
          background:
            "linear-gradient(to bottom, rgba(242,242,247,1) 0%, rgba(242,242,247,1) 40%, rgba(242,242,247,0.6) 70%, rgba(242,242,247,0) 100%)",
          zIndex: 98,
          pointerEvents: "none",
          opacity: activeTab === "menu" && !isMenuScrolled ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* 지도 탭 상/하단 그라데이션 (모바일 헤더/바텀바 끊김 방지) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "calc(env(safe-area-inset-top, 20px) + 8px)",
          background: "linear-gradient(to bottom, rgba(242,242,247,1) 0%, rgba(242,242,247,0.6) 50%, rgba(242,242,247,0) 100%)",
          zIndex: 98,
          pointerEvents: "none",
          opacity: activeTab === "map" ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "calc(env(safe-area-inset-bottom, 0px) + 56px)",
          background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 20%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0) 100%)",
          zIndex: 98,
          pointerEvents: "none",
          opacity: activeTab === "map" ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* 마커 표시 모드 토글 (지도 탭에서만) */}
      {activeTab === "map" && (
        <div
          style={{
            position: "absolute",
            top: menuFilterBarHeight + 16,
            right: 0,
            zIndex: 101,

            display: "flex",
            alignItems: "stretch",
          }}
        >
          {/* 아일랜드 본체 */}
          <div
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderRadius: "14px 0 0 14px",
              padding: "5px 10px 6px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
              border: "1px solid rgba(255,255,255,0.6)",
              borderRight: "none",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              overflow: "hidden",
              maxWidth: markerIslandOpen ? "320px" : "0px",
              paddingLeft: markerIslandOpen ? "10px" : "0px",
              paddingRight: markerIslandOpen ? "10px" : "0px",
              opacity: markerIslandOpen ? 1 : 0,
              transition:
                "max-width 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease, padding 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#aaa",
                letterSpacing: "0.4px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {t[lang].markerLabel}
            </span>
            <div style={{ display: "flex", flexDirection: "row", gap: "4px" }}>
              {(["price", "menu", "name"] as MarkerModeKey[]).map((mode) => {
                const T = t[lang];
                const base =
                  mode === "price"
                    ? T.markerPrice
                    : mode === "menu"
                      ? T.markerMenu
                      : T.markerName;
                const suffix = T.markerSuffix ? ` ${T.markerSuffix}` : "";
                const isActive = markerModes.has(mode);
                return (
                  <button
                    key={mode}
                    onClick={() => handleToggleMarkerMode(mode)}
                    style={{
                      padding: "3px 9px",
                      borderRadius: "8px",
                      border: isActive
                        ? "1.5px solid rgba(0,102,255,0.25)"
                        : "1.5px solid #e5e7eb",
                      background: isActive
                        ? "rgba(0,102,255,0.08)"
                        : "rgba(0,0,0,0.03)",
                      color: isActive ? "#0066ff" : "#555",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {base + suffix}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 토글 탭 */}
          <button
            onClick={() => setMarkerIslandOpen((v) => !v)}
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.6)",
              borderLeft: markerIslandOpen
                ? "1px solid rgba(0,0,0,0.06)"
                : "1px solid rgba(255,255,255,0.6)",
              borderRadius: markerIslandOpen
                ? "0 14px 14px 0"
                : "14px 0 0 14px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
              width: "22px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              color: "#888",
              padding: 0,
              flexShrink: 0,
              transition: "border-radius 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {markerIslandOpen ? "›" : "‹"}
          </button>
        </div>
      )}

      {/* 뽑기 버튼 바 */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "12px",
          right: "72px",
          zIndex: 110,
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "center",
          gap: "6px",
          padding: "6px 8px",
          height: "52px",
          boxSizing: "border-box",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "none",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {/* 되돌리기 버튼: 항상 표시, 비활성 시 disabled 스타일 */}
        {(() => {
          const isUnrollable = rolledId !== null || rolledMenuKey !== null;
          return (
            <button
              onClick={isUnrollable ? handleUnroll : undefined}
              disabled={!isUnrollable}
              id="unroll-btn"
              onPointerDown={(e) => {
                if (!isUnrollable) return;
                const el = e.currentTarget;
                el.style.transform = "scale(0.94)";
              }}
              onPointerUp={(e) => {
                const el = e.currentTarget;
                el.style.transform = "scale(1)";
              }}
              onPointerLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "scale(1)";
              }}
              style={{
                padding: "0 14px",
                background: isUnrollable ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.02)",
                color: isUnrollable ? "#666" : "#ccc",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: isUnrollable ? "pointer" : "default",
                whiteSpace: "nowrap",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "14px" }}>↺</span>
              {t[lang].unroll}
            </button>
          );
        })()}
        <button
          onClick={(e) => {
            handleRoll();
            const el = e.currentTarget;
            el.classList.add("roll-pulse-active");
            setTimeout(() => el.classList.remove("roll-pulse-active"), 600);
          }}
          disabled={filteredList.length === 0}
          onPointerDown={(e) => {
            if (filteredList.length === 0) return;
            e.currentTarget.style.transform = "scale(0.95)";
          }}
          onPointerUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          style={{
            flex: 1,
            padding: "0",
            background: filteredList.length === 0 
              ? "#f5f5f5" 
              : "#0066ff",
            color: filteredList.length === 0 ? "#ccc" : "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: filteredList.length === 0 ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            boxShadow: "none",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          {t[lang].rollRestaurant}
        </button>
        <button
          onClick={(e) => {
            handleRollMenu();
            const el = e.currentTarget;
            el.classList.add("roll-pulse-active");
            setTimeout(() => el.classList.remove("roll-pulse-active"), 600);
          }}
          disabled={filteredList.length === 0}
          onPointerDown={(e) => {
            if (filteredList.length === 0) return;
            e.currentTarget.style.transform = "scale(0.95)";
          }}
          onPointerUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          style={{
            flex: 1,
            padding: "0",
            background: filteredList.length === 0 
              ? "#f5f5f5" 
              : "#0066ff",
            color: filteredList.length === 0 ? "#ccc" : "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: filteredList.length === 0 ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            boxShadow: "none",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          {t[lang].rollMenu}
        </button>
      </div>

      {/* 탭 전환 FAB */}
      <button
        onClick={() => setActiveTab((v) => v === "map" ? "menu" : "map")}
        style={{
          position: "absolute",
          bottom: "16px",
          right: "12px",
          zIndex: 110,
          width: "52px",
          height: "52px",
          boxSizing: "border-box",
          borderRadius: "16px",
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
        }}
        aria-label={activeTab === "map" ? t[lang].tabMenu : t[lang].tabMap}
      >
        <div
          key={activeTab}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: "fabIconPop 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
          }}
        >
          {activeTab === "map" ? (
            /* 지도 탭 → 메뉴판으로 */
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 10.9997H0V12.9997H24V10.9997Z" fill="#111"/>
                <path d="M24 4.00031H0V6.0003H24V4.00031Z" fill="#111"/>
                <path d="M24 18H0V20H24V18Z" fill="#111"/>
              </svg>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#111", marginTop: "2px" }}>
                {t[lang].tabMenu}
              </span>
            </>
          ) : (
            /* 메뉴판 탭 → 지도로 */
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#fab_clip)">
                  <path d="M14.0001 7.00022C14.0001 7.39578 13.8828 7.78246 13.663 8.11136C13.4433 8.44026 13.1309 8.6966 12.7655 8.84798C12.4 8.99935 11.9979 9.03896 11.6099 8.96179C11.222 8.88462 10.8656 8.69414 10.5859 8.41443C10.3062 8.13473 10.1157 7.77836 10.0385 7.3904C9.96136 7.00244 10.001 6.6003 10.1523 6.23485C10.3037 5.8694 10.5601 5.55704 10.889 5.33728C11.2179 5.11752 11.6045 5.00022 12.0001 5.00022C12.5305 5.00022 13.0392 5.21093 13.4143 5.586C13.7894 5.96108 14.0001 6.46978 14.0001 7.00022ZM16.9501 11.9572L12.0001 16.8002L7.0581 11.9642C6.07728 10.9865 5.40854 9.73974 5.13648 8.38181C4.86443 7.02387 5.0013 5.61575 5.52976 4.33562C6.05823 3.0555 6.95455 1.96089 8.1053 1.19033C9.25605 0.419756 10.6095 0.00785145 11.9944 0.00673142C13.3794 0.00561138 14.7335 0.415326 15.8855 1.18403C17.0375 1.95274 17.9356 3.04589 18.4661 4.32516C18.9966 5.60443 19.1358 7.01233 18.8659 8.3707C18.5961 9.72908 17.9293 10.9769 16.9501 11.9562V11.9572ZM16.0001 7.00022C16.0001 6.20909 15.7655 5.43573 15.326 4.77794C14.8865 4.12014 14.2617 3.60745 13.5308 3.3047C12.7999 3.00195 11.9957 2.92274 11.2197 3.07708C10.4438 3.23142 9.73108 3.61238 9.17167 4.17179C8.61226 4.7312 8.2313 5.44393 8.07696 6.21986C7.92262 6.99578 8.00183 7.80005 8.30458 8.53095C8.60733 9.26186 9.12002 9.88657 9.77782 10.3261C10.4356 10.7656 11.209 11.0002 12.0001 11.0002C13.061 11.0002 14.0784 10.5788 14.8285 9.82865C15.5787 9.0785 16.0001 8.06108 16.0001 7.00022ZM21.8671 10.6132L20.4321 10.1332C19.9855 11.3499 19.2799 12.4551 18.3641 13.3722L12.0001 19.6002L5.6601 13.4002C4.4566 12.2012 3.61752 10.6856 3.2401 9.02922C2.82784 8.99127 2.4122 9.03999 2.01989 9.17225C1.62758 9.30451 1.26728 9.51738 0.962144 9.79719C0.657006 10.077 0.413781 10.4175 0.248098 10.7969C0.0824153 11.1763 -0.00205971 11.5862 0.00010148 12.0002V21.7522L7.9831 24.0332L16.0031 22.0332L24.0031 23.9812V13.4832C24.0027 12.8387 23.7947 12.2115 23.41 11.6944C23.0253 11.1773 22.4843 10.7978 21.8671 10.6122V10.6132Z" fill="#111"/>
                </g>
                <defs>
                  <clipPath id="fab_clip">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#111", marginTop: "2px" }}>
                {t[lang].tabMap}
              </span>
            </>
          )}
        </div>
      </button>

      {/* 메뉴판 뷰 */}
      {activeTab === "menu" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1, animation: "menuViewFadeIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards" }}>
          <MenuView
          filteredList={
            rolledRestaurant
              ? [rolledRestaurant]
              : rolledMenuRestaurant
                ? [rolledMenuRestaurant]
                : filteredList
          }
          filteredMenuIds={
            rolledRestaurant
              ? null
              : rolledMenuKey
                ? rolledMenuIdSet
                : filteredMenuIds
          }
          isRolled={!!rolledRestaurant || !!rolledMenuRestaurant}
          sortOrder={sortOrder}
          menuFilterBarHeight={menuFilterBarHeight + 8}
          scrollPaddingTop={menuFilterBarHeight + 8}
          scrollPaddingBottom={80}
          onScrollRefReady={(node) => {
            // 이전 리스너 정리
            savedScrollListenerCleanup.current?.();
            savedScrollListenerCleanup.current = null;
            menuScrollRef.current = node;
            if (!node) return;
            // 탭에서 돌아왔을 때 저장된 스크롤 위치로 복원
            if (savedMenuScrollTop.current > 0) {
              node.scrollTop = savedMenuScrollTop.current;
            }
            const handler = () => {
              const scrolled = node.scrollTop > 5;
              savedMenuScrollTop.current = node.scrollTop;
              setIsMenuScrolled(scrolled);

              // 더 빠른 반응을 위해 직접 DOM 조작 병행
              const backdrop = document.querySelector(".header-backdrop");
              if (backdrop) {
                if (scrolled) backdrop.classList.add("is-scrolled");
                else backdrop.classList.remove("is-scrolled");
              }
            };
            node.addEventListener("scroll", handler, { passive: true });
            savedScrollListenerCleanup.current = () =>
              node.removeEventListener("scroll", handler);
          }}
          onRestaurantClick={openShopModal}
        />
        </div>
      )}

      {/* 헤더 영역 그룹 (MenuView보다 나중에 배치하여 z-index 및 렌더링 순서 확보) */}
      <div style={{ zIndex: 500, position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* 통합 배경 backdrop */}
        <div
          className={`header-backdrop ${activeTab === "map" || isMenuScrolled ? "is-scrolled" : ""}`}
          style={{ height: menuFilterBarHeight }}
        />

        {/* 헤더 본체 */}
        <HeaderSection
          searchQuery={searchQuery}
          showHint1={showHint1}
          langMenuOpen={langMenuOpen}
          headerRowRef={headerRowRef}
          langBtnRef={langBtnRef}
          onSearchBarClick={() => {
            setSearchInput(searchQuery);
            setSearchModalOpen(true);
          }}
          onClearSearch={handleClearSearch}
          onDismissHint={() => setShowHint1(false)}
          onOpenLangMenu={openLangMenu}
          onCloseLangMenu={closeLangMenu}
          onHeaderResize={setHeaderHeight}
          isScrolled={activeTab === "menu" && isMenuScrolled}
        />

        {/* 필터 바 */}
        <FilterBar
          filters={filters}
          maxPrice={maxPrice}
          sortOrder={sortOrder}
          sortDropdownOpen={sortDropdownOpen}
          sortDropdownVisible={sortDropdownVisible}
          sortDropdownPos={sortDropdownPos}
          sortBtnRef={sortBtnRef}
          filterSheetOpen={filterSheetOpen}
          onSortChange={setSortOrder}
          onOpenSortDropdown={openSortDropdown}
          onCloseSortDropdown={closeSortDropdown}
          onOpenFilterSheet={openFilterSheet}
          onToggleFilter={toggleFilter}
          onClearPrice={handleClearPrice}
          onFilterBarResize={setMenuFilterBarHeight}
          headerOffset={headerHeight}
          zIndex={501}
        />
      </div>

      {/* 언어 선택 드롭다운 — 모든 stacking context 밖에서 fixed 렌더 */}
      {langMenuOpen && (
        <>
          <div
            onClick={closeLangMenu}
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
          />
          <div
            style={{
              position: "fixed",
              top: langMenuPos.top,
              right: langMenuPos.right,
              zIndex: 9999,
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              border: "1px solid rgba(255,255,255,0.6)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              opacity: langMenuVisible ? 1 : 0,
              transform: langMenuVisible ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.96)",
              transformOrigin: "top right",
              transition: "opacity 0.18s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => { setLang(l as Lang); closeLangMenu(); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "9px 16px",
                  background: l === lang ? "rgba(0,102,255,0.08)" : "none",
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
                  {l === "ko" ? "한국어" : l === "en" ? "English" : l === "zh" ? "中文" : l === "ja" ? "日本語" : "Tiếng Việt"}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* 토스트 */}
      <div
        style={{
          position: "fixed",
          top: menuFilterBarHeight + 8,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10002,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
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
        <SearchModal
          searchInput={searchInput}
          searchTarget={searchTarget}
          searchModalRef={searchModalRef}
          searchInputRef={searchInputRef}
          searchLockRef={searchLockRef}
          onClose={closeSearchModal}
          onSearchInputChange={setSearchInput}
          onSearchTargetChange={setSearchTarget}
          onApplySearch={handleApplySearch}
          onDragStart={onSearchDragStart}
          onDragMove={onSearchDragMove}
          onDragEnd={onSearchDragEnd}
          isDragging={isSearchDragging}
        />
      )}

      {/* 가게 상세 모달 */}
      {selectedRestaurant && (
        <ShopDetailModal
          restaurant={selectedRestaurant}
          shopModalClosing={shopModalClosing}
          isScrolledToBottom={isScrolledToBottom}
          shopModalRef={shopModalRef}
          modalScrollRef={modalScrollRef}
          onClose={closeShopModal}
          onModalScroll={handleModalScroll}
          onDragStart={onShopDragStart}
          onScrollAreaTouchStart={onScrollAreaTouchStart}
          onCopyToast={showCopyToast}
        />
      )}

      {/* 필터 바텀시트 */}
      {filterSheetOpen && (
        <FilterSheet
          filters={filters}
          maxPrice={maxPrice}
          onApply={(localFilters, localMaxPrice) => {
            applyFilterSheet(localFilters.cat, localFilters.tags);
            if (localMaxPrice === null) {
              handleClearPrice();
            } else {
              setMaxPrice(localMaxPrice);
              setSliderValue(localMaxPrice);
              setMarkerModes((prev) => prev.has("menu") ? prev : new Set([...prev, "menu"]));
            }
            closeFilterSheet();
          }}
          onClose={closeFilterSheet}
          isClosing={filterSheetClosing}
        />
      )}

      {/* 뽑기 애니메이션 (파티클) */}
      <Confetti trigger={confettiTrigger} />
    </div>
  );
}
