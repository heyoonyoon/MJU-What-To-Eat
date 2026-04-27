import { useState, useRef, useCallback } from "react";
import NaverMap from "../NaverMap";
import { useLang } from "../../LangContext";
import type { Lang } from "../../i18n";
import type { Restaurant } from "../../types/restaurant";

import { useSearchStore } from "../../store/useSearchStore";
import { useBottomSheet } from "./hooks/useBottomSheet";
import { useSearchModal } from "./hooks/useSearchModal";
import { useToast } from "./hooks/useToast";
import { useMarkerMode } from "./hooks/useMarkerMode";
import { useLangMenu } from "./hooks/useLangMenu";
import { useCopyToast } from "./hooks/useCopyToast";
import { useSortDropdown } from "./hooks/useSortDropdown";
import { useMenuScroll } from "./hooks/useMenuScroll";

import HeaderSection from "./components/HeaderSection";
import FilterBar from "./components/FilterBar";
import FilterSheet from "./components/FilterSheet";
import MenuView from "./components/MenuView";
import SearchModal from "./components/SearchModal";
import ShopDetailModal from "./components/ShopDetailModal";
import MapAnimations from "./components/MapAnimations";
import MarkerIsland from "./components/MarkerIsland";
import TabFab from "./components/TabFab";
import LangDropdown from "./components/LangDropdown";
import ToastStack from "./components/ToastStack";
import BottomTabBar, { type BottomTab } from "../BottomTabBar";

import type { MarkerModeKey, MarkerModes } from "../NaverMap";
import { restaurants } from "../../data2";
import { applyTagFilter, applyPriceFilter } from "./utils";

type Props = {
  initialTab?: "map" | "menu";
  onTabChange: (tab: BottomTab) => void;
};

export default function MapSelector({ initialTab = "map", onTabChange }: Props) {
  const { lang, setLang } = useLang();

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
    sortOrder,
    setSortOrder,
  } = useSearchStore();

  // sortedList — store는 정렬 없이 filteredList를 그대로 줌, 여기서 정렬
  const sortedList = (() => {
    if (sortOrder === "priceLow") {
      return [...filteredList].sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
    }
    if (sortOrder === "priceHigh") {
      return [...filteredList].sort((a, b) => (b.minPrice ?? -Infinity) - (a.minPrice ?? -Infinity));
    }
    return filteredList;
  })();

  const modalScrollRef = useRef<HTMLDivElement | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const scrollHintEnabledRef = useRef(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const {
    isOpen: shopSheetOpen,
    open: _openShopSheet,
    close: closeShopModal,
    onSheetReady: shopSheetReady,
    onOverlayReady: shopOverlayReady,
    onDragStart: shopDragStart,
    onScrollAreaTouchStart,
  } = useBottomSheet({ closeDuration: 260, scrollRef: modalScrollRef });

  const openShopModal = useCallback((r: Restaurant) => {
    setSelectedRestaurant(r);
    scrollHintEnabledRef.current = false;
    setIsScrolledToBottom(false);
    _openShopSheet();
    setTimeout(() => {
      const el = modalScrollRef.current;
      if (!el) return;
      const enabled = el.scrollHeight - el.clientHeight >= 120;
      scrollHintEnabledRef.current = enabled;
      setIsScrolledToBottom(!enabled);
    }, 0);
  }, [_openShopSheet]);

  const handleModalScroll = useCallback(() => {
    if (!scrollHintEnabledRef.current) return;
    const el = modalScrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    setIsScrolledToBottom(atBottom);
  }, []);

  const handleCloseShopModal = useCallback(() => {
    closeShopModal();
    setTimeout(() => setSelectedRestaurant(null), 280);
  }, [closeShopModal]);

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
  const {
    markerModes,
    setMarkerModes,
    markerIslandOpen,
    setMarkerIslandOpen,
    handleToggleMarkerMode,
  } = useMarkerMode();
  const {
    langMenuOpen,
    langMenuVisible,
    langMenuPos,
    langBtnRef,
    openLangMenu,
    closeLangMenu,
  } = useLangMenu();
  const { showCopyToast } = useCopyToast(lang, showToast);
  const {
    sortDropdownOpen,
    sortDropdownVisible,
    sortDropdownPos,
    sortBtnRef,
    openSortDropdownSafe,
    closeSortDropdown,
  } = useSortDropdown();
  const {
    isOpen: filterSheetOpen,
    open: openFilterSheet,
    close: closeFilterSheet,
    onSheetReady: filterSheetReady,
    onOverlayReady: filterOverlayReady,
    onDragStart: filterSheetDragStart,
  } = useBottomSheet();

  const [focusTarget, setFocusTarget] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState<"map" | "menu">(initialTab);
  const isInitialMenuMount = useRef(initialTab !== "menu");
  const [menuFilterBarHeight, setMenuFilterBarHeight] = useState(160);
  const [headerHeight, setHeaderHeight] = useState(70);
  const [showHint1, setShowHint1] = useState(false);

  const headerRowRef = useRef<HTMLDivElement | null>(null);

  const { isMenuScrolled, onScrollRefReady } = useMenuScroll(
    filteredList,
    sortedList,
  );

  const handleClearPrice = () => {
    setMaxPrice(null);
  };

  const handleClearSearch = () => {
    setSearchQuery("", "menu");
    setSearchInput("");
  };

  const handleApplySearch = (input: string, target: "name" | "menu") => {
    const q = input.trim().toLowerCase();
    const menuQ = q && target === "menu" ? q : undefined;
    const matched = q
      ? restaurants.filter((r) => {
          const typeOk = filters.type.length === 0 || filters.type.includes(r.type);
          const catOk = filters.cat.includes("전체") || filters.cat.includes(r.category);
          const zoneOk = filters.zone.length === 0 || filters.zone.includes(r.zone);
          const tagsOk = applyTagFilter(r, filters.tags);
          const priceOk = applyPriceFilter(r, maxPrice, menuQ);
          if (!typeOk || !catOk || !zoneOk || !tagsOk || !priceOk) return false;
          if (target === "name") return r.name.toLowerCase().includes(q);
          return (r.menus || []).some((m) =>
            Object.values(m.name).some((v) => v.toLowerCase().includes(q)),
          );
        })
      : restaurants;

    setSearchQuery(input, target);

    if (matched.length === 0) {
      showToast("검색 결과가 없습니다");
      return;
    }

    const modeKey: MarkerModeKey = target === "menu" ? "menu" : "name";
    setMarkerModes((prev: MarkerModes) => {
      if (prev.has(modeKey)) return prev;
      return new Set([...prev, modeKey]);
    });
    if (matched.length > 0) setFocusTarget(matched[0]);
    closeSearchModal();
    setMarkerIslandOpen(false);
  };

  const displayList = filteredList;
  const displayMenuIds = filteredMenuIds;
  const menuViewList = sortedList;

  // 탭바 클릭: 지도/메뉴 탭은 내부 전환, 카드는 상위로 위임
  const handleBottomTabChange = (tab: BottomTab) => {
    if (tab === "map") {
      isInitialMenuMount.current = false;
      setActiveTab("map");
    } else if (tab === "menu") {
      isInitialMenuMount.current = false;
      setActiveTab("menu");
    } else {
      onTabChange(tab);
    }
  };

  const currentBottomTab: BottomTab = activeTab === "map" ? "map" : "menu";

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <MapAnimations />

      <NaverMap
        displayList={displayList}
        focusTarget={focusTarget}
        markerModes={markerModes}
        onMarkerClick={openShopModal}
        filteredMenuIds={displayMenuIds}
      />

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
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "calc(env(safe-area-inset-top, 20px) + 8px)",
          background:
            "linear-gradient(to bottom, rgba(242,242,247,1) 0%, rgba(242,242,247,0.6) 50%, rgba(242,242,247,0) 100%)",
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
          background:
            "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 20%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0) 100%)",
          zIndex: 98,
          pointerEvents: "none",
          opacity: activeTab === "map" ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />

      {activeTab === "map" && (
        <MarkerIsland
          lang={lang}
          markerModes={markerModes}
          markerIslandOpen={markerIslandOpen}
          menuFilterBarHeight={menuFilterBarHeight}
          onToggleMarkerMode={handleToggleMarkerMode}
          onToggleIsland={() => setMarkerIslandOpen((v) => !v)}
        />
      )}

      {activeTab === "menu" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <MenuView
            filteredList={menuViewList}
            filteredMenuIds={displayMenuIds}
            isRolled={false}
            sortOrder={sortOrder}
            skipAnimation={isInitialMenuMount.current}
            menuFilterBarHeight={menuFilterBarHeight + 8}
            scrollPaddingTop={menuFilterBarHeight + 8}
            scrollPaddingBottom={80 + 56}
            onScrollRefReady={onScrollRefReady}
            onRestaurantClick={openShopModal}
          />
        </div>
      )}

      <TabFab
        lang={lang}
        activeTab={activeTab}
        onTabToggle={() => {
          isInitialMenuMount.current = false;
          setActiveTab((v) => (v === "map" ? "menu" : "map"));
        }}
      />

      <div
        style={{
          zIndex: 500,
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        <div
          className={`header-backdrop ${activeTab === "map" || isMenuScrolled ? "is-scrolled" : ""}`}
          style={{ height: menuFilterBarHeight }}
        />
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
        <FilterBar
          filters={filters}
          maxPrice={maxPrice}
          searchQuery={searchQuery}
          appliedTarget={appliedTarget}
          onClearSearch={handleClearSearch}
          sortOrder={sortOrder}
          sortDropdownOpen={sortDropdownOpen}
          sortDropdownVisible={sortDropdownVisible}
          sortDropdownPos={sortDropdownPos}
          sortBtnRef={sortBtnRef}
          filterSheetOpen={filterSheetOpen}
          onSortChange={setSortOrder}
          onOpenSortDropdown={openSortDropdownSafe}
          onCloseSortDropdown={closeSortDropdown}
          onOpenFilterSheet={openFilterSheet}
          onToggleFilter={toggleFilter}
          onClearPrice={handleClearPrice}
          onFilterBarResize={setMenuFilterBarHeight}
          headerOffset={headerHeight}
          zIndex={501}
          isMapTab={activeTab === "map"}
        />
      </div>

      {langMenuOpen && (
        <LangDropdown
          lang={lang}
          langMenuVisible={langMenuVisible}
          langMenuPos={langMenuPos}
          onClose={closeLangMenu}
          onSelect={(l: Lang) => {
            setLang(l);
            closeLangMenu();
          }}
        />
      )}

      <ToastStack toasts={toasts} topOffset={menuFilterBarHeight + 8} />

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

      {selectedRestaurant && shopSheetOpen && (
        <ShopDetailModal
          restaurant={selectedRestaurant}
          isScrolledToBottom={isScrolledToBottom}
          modalScrollRef={modalScrollRef}
          onClose={handleCloseShopModal}
          onModalScroll={handleModalScroll}
          onSheetReady={shopSheetReady}
          onOverlayReady={shopOverlayReady}
          onDragStart={shopDragStart}
          onScrollAreaTouchStart={onScrollAreaTouchStart}
          onCopyToast={showCopyToast}
        />
      )}

      {filterSheetOpen && (
        <FilterSheet
          filters={filters}
          maxPrice={maxPrice}
          onApply={(localFilters, localMaxPrice) => {
            applyFilterSheet(localFilters.cat, localFilters.tags);
            if (localMaxPrice === null) handleClearPrice();
            else {
              setMaxPrice(localMaxPrice);
              setMarkerModes((prev) =>
                prev.has("menu") ? prev : new Set([...prev, "menu"]),
              );
            }
            closeFilterSheet();
          }}
          onClose={closeFilterSheet}
          onSheetReady={filterSheetReady}
          onOverlayReady={filterOverlayReady}
          onDragStart={filterSheetDragStart}
        />
      )}


      <BottomTabBar activeTab={currentBottomTab} onTabChange={handleBottomTabChange} />
    </div>
  );
}
