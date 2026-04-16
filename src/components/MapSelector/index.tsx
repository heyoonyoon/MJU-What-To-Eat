import { useState, useRef, useEffect, useCallback } from "react";
import NaverMap from "../NaverMap";
import type { MarkerModeKey, MarkerModes } from "../NaverMap";
import { useLang } from "../../LangContext";
import { t } from "../../i18n";
import type { Restaurant } from "../../data2";

import { useFilterState } from "./hooks/useFilterState";
import { useShopModal } from "./hooks/useShopModal";
import { useSearchModal } from "./hooks/useSearchModal";
import { useToast } from "./hooks/useToast";

import HeaderSection from "./components/HeaderSection";
import FilterBar from "./components/FilterBar";
import MenuView from "./components/MenuView";
import SearchModal from "./components/SearchModal";
import ShopDetailModal from "./components/ShopDetailModal";

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
    clearTagFilters,
    applySearch,
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
  const [rolledId, setRolledId] = useState<string | null>(null);
  const [rolledMenuKey, setRolledMenuKey] = useState<{
    restaurantId: string;
    menuId: string;
  } | null>(null);
  const [showHint1, setShowHint1] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [langMenuVisible, setLangMenuVisible] = useState(false);
  const [priceSliderOpen, setPriceSliderOpen] = useState(false);
  const [priceSliderVisible, setPriceSliderVisible] = useState(false);
  const [sliderValue, setSliderValue] = useState(PRICE_MAX);
  const [pricePopupPos, setPricePopupPos] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const [markerModes, setMarkerModes] = useState<MarkerModes>(
    new Set(["price"]),
  );
  const [activeTab, setActiveTab] = useState<"map" | "menu">("menu");
  const [markerIslandOpen, setMarkerIslandOpen] = useState(true);
  const [menuFilterBarHeight, setMenuFilterBarHeight] = useState(160);
  const [headerHeight, setHeaderHeight] = useState(70);

  // refs
  const priceButtonRef = useRef<HTMLButtonElement | null>(null);
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
    setLangMenuOpen(true);
    requestAnimationFrame(() => setLangMenuVisible(true));
  }, []);

  const closeLangMenu = useCallback(() => {
    setLangMenuVisible(false);
    setTimeout(() => setLangMenuOpen(false), 180);
  }, []);

  const openPriceSlider = useCallback(() => {
    const rect = priceButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setPricePopupPos({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
    setPriceSliderOpen(true);
    requestAnimationFrame(() => setPriceSliderVisible(true));
  }, []);

  const closePriceSlider = useCallback(() => {
    setPriceSliderVisible(false);
    setTimeout(() => setPriceSliderOpen(false), 180);
  }, []);

  const handleApplyPrice = useCallback(() => {
    setMaxPrice(sliderValue);
    closePriceSlider();
    setMarkerModes((prev) => {
      if (prev.has("menu")) return prev;
      return new Set([...prev, "menu"]);
    });
  }, [sliderValue, closePriceSlider, setMaxPrice]);

  const handleClearPrice = useCallback(() => {
    setMaxPrice(null);
    setSliderValue(PRICE_MAX);
    closePriceSlider();
  }, [closePriceSlider, setMaxPrice]);

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
  }, [filteredList]);

  const handleRollMenu = useCallback(() => {
    setRolledId(null);
    // filteredMenuIds가 있으면 그 안에서, null이면 filteredList 전체 메뉴에서 뽑기
    const allMenus = filteredList.flatMap((r) =>
      r.menus
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

  const showCopyToast = useCallback(
    (text: string, label: string) => {
      navigator.clipboard.writeText(text);
      const T = t[lang];
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
        .roll-btn-pressing {
          animation: rollBtnPress 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
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

      {/* 상단 그라데이션 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "16px",
          background:
            "linear-gradient(to bottom, rgba(242,242,247,1) 0%, rgba(242,242,247,1) 40%, rgba(242,242,247,0.6) 70%, rgba(242,242,247,0) 100%)",
          zIndex: 98,
          pointerEvents: "none",
        }}
      />

      {/* 헤더 */}
      <HeaderSection
        searchQuery={searchQuery}
        showHint1={showHint1}
        langMenuOpen={langMenuOpen}
        langMenuVisible={langMenuVisible}
        headerRowRef={headerRowRef}
        onSearchBarClick={() => {
          setSearchInput(searchQuery);
          setSearchModalOpen(true);
        }}
        onClearSearch={handleClearSearch}
        onDismissHint={() => setShowHint1(false)}
        onOpenLangMenu={openLangMenu}
        onCloseLangMenu={closeLangMenu}
        onSetLang={(l) => {
          setLang(l);
          closeLangMenu();
        }}
        onHeaderResize={setHeaderHeight}
      />

      {/* 필터 바 */}
      <FilterBar
        filters={filters}
        maxPrice={maxPrice}
        priceSliderOpen={priceSliderOpen}
        priceSliderVisible={priceSliderVisible}
        sliderValue={sliderValue}
        pricePopupPos={pricePopupPos}
        priceButtonRef={priceButtonRef}
        onToggleFilter={toggleFilter}
        onClearTagFilters={clearTagFilters}
        onOpenPriceSlider={openPriceSlider}
        onClosePriceSlider={closePriceSlider}
        onSliderChange={setSliderValue}
        onApplyPrice={handleApplyPrice}
        onClearPrice={handleClearPrice}
        onFilterBarResize={setMenuFilterBarHeight}
        headerOffset={headerHeight + 16}
      />

      {/* 마커 표시 모드 토글 (지도 탭에서만) */}
      {activeTab === "map" && (
        <div
          style={{
            position: "absolute",
            top: menuFilterBarHeight - 4,
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
          bottom: "64px",
          left: "12px",
          right: "12px",
          zIndex: 110,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "6px 8px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "14px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* 되돌리기 버튼: 항상 표시, 비활성 시 disabled 스타일 */}
        {(() => {
          const isUnrollable = rolledId !== null || rolledMenuKey !== null;
          return (
            <button
              onClick={isUnrollable ? handleUnroll : undefined}
              disabled={!isUnrollable}
              style={{
                padding: "8px 12px",
                background: "rgba(0,0,0,0.03)",
                color: isUnrollable ? "#444" : "#c4c4c4",
                border: isUnrollable
                  ? "1.5px solid #d1d5db"
                  : "1.5px solid #e9e9e9",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: isUnrollable ? "pointer" : "default",
                whiteSpace: "nowrap",
                transition: "all 0.18s ease",
                flexShrink: 0,
              }}
            >
              {t[lang].unroll}
            </button>
          );
        })()}
        <button
          onClick={handleRoll}
          disabled={filteredList.length === 0}
          onPointerDown={(e) => {
            if (filteredList.length === 0) return;
            const el = e.currentTarget;
            el.classList.remove("roll-btn-pressing");
            void el.offsetWidth;
            el.classList.add("roll-btn-pressing");
            el.addEventListener("animationend", () => el.classList.remove("roll-btn-pressing"), { once: true });
          }}
          style={{
            flex: 1,
            padding: "8px 0",
            background: "rgba(0,0,0,0.03)",
            color: filteredList.length === 0 ? "#c4c4c4" : "#333",
            border: `1.5px solid ${filteredList.length === 0 ? "#e9e9e9" : "#d1d5db"}`,
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: filteredList.length === 0 ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {t[lang].rollRestaurant}
        </button>
        <button
          onClick={handleRollMenu}
          disabled={filteredList.length === 0}
          onPointerDown={(e) => {
            if (filteredList.length === 0) return;
            const el = e.currentTarget;
            el.classList.remove("roll-btn-pressing");
            void el.offsetWidth;
            el.classList.add("roll-btn-pressing");
            el.addEventListener("animationend", () => el.classList.remove("roll-btn-pressing"), { once: true });
          }}
          style={{
            flex: 1,
            padding: "8px 0",
            background: "rgba(0,0,0,0.03)",
            color: filteredList.length === 0 ? "#c4c4c4" : "#333",
            border: `1.5px solid ${filteredList.length === 0 ? "#e9e9e9" : "#d1d5db"}`,
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: filteredList.length === 0 ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {t[lang].rollMenu}
        </button>
      </div>

      {/* 하단 탭 바 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 110,
          height: "56px",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          borderRadius: "20px 20px 0 0",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
        }}
      >
        {(["menu", "map"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const T = t[lang];
          const label = tab === "map" ? T.tabMap : T.tabMenu;
          const mapColor = isActive ? "#111111" : "#aab4be";
          const icon =
            tab === "map" ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_504_7)">
                  <path d="M14.0001 7.00022C14.0001 7.39578 13.8828 7.78246 13.663 8.11136C13.4433 8.44026 13.1309 8.6966 12.7655 8.84798C12.4 8.99935 11.9979 9.03896 11.6099 8.96179C11.222 8.88462 10.8656 8.69414 10.5859 8.41443C10.3062 8.13473 10.1157 7.77836 10.0385 7.3904C9.96136 7.00244 10.001 6.6003 10.1523 6.23485C10.3037 5.8694 10.5601 5.55704 10.889 5.33728C11.2179 5.11752 11.6045 5.00022 12.0001 5.00022C12.5305 5.00022 13.0392 5.21093 13.4143 5.586C13.7894 5.96108 14.0001 6.46978 14.0001 7.00022ZM16.9501 11.9572L12.0001 16.8002L7.0581 11.9642C6.07728 10.9865 5.40854 9.73974 5.13648 8.38181C4.86443 7.02387 5.0013 5.61575 5.52976 4.33562C6.05823 3.0555 6.95455 1.96089 8.1053 1.19033C9.25605 0.419756 10.6095 0.00785145 11.9944 0.00673142C13.3794 0.00561138 14.7335 0.415326 15.8855 1.18403C17.0375 1.95274 17.9356 3.04589 18.4661 4.32516C18.9966 5.60443 19.1358 7.01233 18.8659 8.3707C18.5961 9.72908 17.9293 10.9769 16.9501 11.9562V11.9572ZM16.0001 7.00022C16.0001 6.20909 15.7655 5.43573 15.326 4.77794C14.8865 4.12014 14.2617 3.60745 13.5308 3.3047C12.7999 3.00195 11.9957 2.92274 11.2197 3.07708C10.4438 3.23142 9.73108 3.61238 9.17167 4.17179C8.61226 4.7312 8.2313 5.44393 8.07696 6.21986C7.92262 6.99578 8.00183 7.80005 8.30458 8.53095C8.60733 9.26186 9.12002 9.88657 9.77782 10.3261C10.4356 10.7656 11.209 11.0002 12.0001 11.0002C13.061 11.0002 14.0784 10.5788 14.8285 9.82865C15.5787 9.0785 16.0001 8.06108 16.0001 7.00022ZM21.8671 10.6132L20.4321 10.1332C19.9855 11.3499 19.2799 12.4551 18.3641 13.3722L12.0001 19.6002L5.6601 13.4002C4.4566 12.2012 3.61752 10.6856 3.2401 9.02922C2.82784 8.99127 2.4122 9.03999 2.01989 9.17225C1.62758 9.30451 1.26728 9.51738 0.962144 9.79719C0.657006 10.077 0.413781 10.4175 0.248098 10.7969C0.0824153 11.1763 -0.00205971 11.5862 0.00010148 12.0002V21.7522L7.9831 24.0332L16.0031 22.0332L24.0031 23.9812V13.4832C24.0027 12.8387 23.7947 12.2115 23.41 11.6944C23.0253 11.1773 22.4843 10.7978 21.8671 10.6122V10.6132Z" fill={mapColor}/>
                </g>
                <defs>
                  <clipPath id="clip0_504_7">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 10.9997H0V12.9997H24V10.9997Z" fill={mapColor}/>
                <path d="M24 4.00031H0V6.0003H24V4.00031Z" fill={mapColor}/>
                <path d="M24 18H0V20H24V18Z" fill={mapColor}/>
              </svg>
            );
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: isActive ? "#111111" : "#aab4be",
                transition: "color 0.15s ease",
              }}
            >
              <span style={{ lineHeight: 1 }}>{icon}</span>
              <span
                style={{ fontSize: "11px", fontWeight: isActive ? 700 : 500 }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 메뉴판 뷰 */}
      {activeTab === "menu" && (
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
          menuFilterBarHeight={menuFilterBarHeight}
          scrollPaddingTop={menuFilterBarHeight}
          scrollPaddingBottom={124}
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
            // 탭 위치 저장용 리스너 (state 업데이트 없음 — ref만 업데이트)
            const handler = () => {
              savedMenuScrollTop.current = node.scrollTop;
            };
            node.addEventListener("scroll", handler, { passive: true });
            savedScrollListenerCleanup.current = () =>
              node.removeEventListener("scroll", handler);
          }}
          onRestaurantClick={openShopModal}
        />
      )}

      {/* 검색어 스낵바 — 필터 영역 아래 */}
      {searchQuery && (
        <div
          style={{
            position: "absolute",
            top: menuFilterBarHeight + 8,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "12px",
            padding: "10px 16px",
            color: "white",
            whiteSpace: "nowrap",
            pointerEvents: "auto",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 400, color: "white" }}>
            🔍 {appliedTarget === "menu" ? t[lang].searchByMenu : t[lang].searchByName}:{" "}
            <strong>"{searchQuery}"</strong>
          </span>
          <button
            onClick={handleClearSearch}
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

      {/* 토스트 */}
      <div
        style={{
          position: "absolute",
          top: menuFilterBarHeight + (searchQuery ? 58 : 8),
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
          onCopyToast={showCopyToast}
        />
      )}
    </div>
  );
}
