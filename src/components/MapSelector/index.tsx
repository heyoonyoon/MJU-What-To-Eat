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
  const [showHint1, setShowHint1] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [langMenuVisible, setLangMenuVisible] = useState(false);
  const [priceSliderOpen, setPriceSliderOpen] = useState(false);
  const [priceSliderVisible, setPriceSliderVisible] = useState(false);
  const [sliderValue, setSliderValue] = useState(PRICE_MAX);
  const [pricePopupPos, setPricePopupPos] = useState<{
    bottom: number;
    left: number;
  }>({ bottom: 0, left: 0 });
  const [markerModes, setMarkerModes] = useState<MarkerModes>(
    new Set(["price"]),
  );
  const [activeTab, setActiveTab] = useState<"map" | "menu">("menu");
  const [menuViewMode, setMenuViewMode] = useState<"grid" | "list">("grid");
  const [menuScrollTop, setMenuScrollTop] = useState(0);
  const [menuContainerHeight, setMenuContainerHeight] = useState(600);
  const [menuContainerWidth, setMenuContainerWidth] = useState(
    () => window.innerWidth,
  );
  const [menuFilterBarHeight, setMenuFilterBarHeight] = useState(160);
  const [headerHeight, setHeaderHeight] = useState(70);

  // refs
  const priceButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuScrollRef = useRef<HTMLDivElement | null>(null);
  const headerRowRef = useRef<HTMLDivElement | null>(null);
  const titleIslandRef = useRef<HTMLDivElement | null>(null);

  // 필터 변경 시 스크롤 리셋
  // scrollTo fires the onScroll handler which updates menuScrollTop via onScrollTopChange
  useEffect(() => {
    menuScrollRef.current?.scrollTo(0, 0);
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
        bottom: window.innerHeight - rect.top + 8,
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

  const handleRoll = useCallback(() => {
    const shuffled = [...filteredList].sort(() => 0.5 - Math.random());
    const result = shuffled.slice(0, 1);
    setFocusTarget(result[0] ?? null);
  }, [filteredList]);

  const handleApplySearch = useCallback(
    (input: string, target: "name" | "menu") => {
      const count = applySearch(input, target, setMarkerModes, setFocusTarget);
      if (count > 0) closeSearchModal();
      else showToast("검색 결과가 없습니다");
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
      `}</style>

      {/* 지도 */}
      <NaverMap
        displayList={filteredList}
        focusTarget={focusTarget}
        markerModes={markerModes}
        onMarkerClick={openShopModal}
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
        activeTab={activeTab}
        searchQuery={searchQuery}
        appliedTarget={appliedTarget}
        markerModes={markerModes}
        showHint1={showHint1}
        langMenuOpen={langMenuOpen}
        langMenuVisible={langMenuVisible}
        headerRowRef={headerRowRef}
        titleIslandRef={titleIslandRef}
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
        onToggleMarkerMode={handleToggleMarkerMode}
        onHeaderResize={setHeaderHeight}
      />

      {/* 필터 바 */}
      <FilterBar
        activeTab={activeTab}
        filteredList={filteredList}
        filters={filters}
        maxPrice={maxPrice}
        priceSliderOpen={priceSliderOpen}
        priceSliderVisible={priceSliderVisible}
        sliderValue={sliderValue}
        pricePopupPos={pricePopupPos}
        priceButtonRef={priceButtonRef}
        onRoll={handleRoll}
        onToggleFilter={toggleFilter}
        onClearTagFilters={clearTagFilters}
        onOpenPriceSlider={openPriceSlider}
        onClosePriceSlider={closePriceSlider}
        onSliderChange={setSliderValue}
        onApplyPrice={handleApplyPrice}
        onClearPrice={handleClearPrice}
        onFilterBarResize={setMenuFilterBarHeight}
      />

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
          borderTop: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
        }}
      >
        {(["menu", "map"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const T = t[lang];
          const label = tab === "map" ? T.tabMap : T.tabMenu;
          const icon = tab === "map" ? "🗺️" : "📋";
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
                color: isActive ? "#0066ff" : "#888",
                borderTop: isActive
                  ? "2px solid #0066ff"
                  : "2px solid transparent",
                transition: "color 0.15s ease, border-color 0.15s ease",
              }}
            >
              <span style={{ fontSize: "18px", lineHeight: 1 }}>{icon}</span>
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
          filteredList={filteredList}
          filteredMenuIds={filteredMenuIds}
          menuViewMode={menuViewMode}
          menuScrollTop={menuScrollTop}
          menuContainerHeight={menuContainerHeight}
          menuContainerWidth={menuContainerWidth}
          menuFilterBarHeight={menuFilterBarHeight + headerHeight + 16}
          scrollPaddingTop={headerHeight + 30}
          menuScrollRef={menuScrollRef}
          onScrollTopChange={setMenuScrollTop}
          onContainerResize={(h, w) => {
            setMenuContainerHeight(h);
            setMenuContainerWidth(w);
          }}
          onViewModeChange={setMenuViewMode}
          onRestaurantClick={openShopModal}
        />
      )}

      {/* 토스트 */}
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
