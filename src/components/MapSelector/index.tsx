import { useState, useRef } from "react";
import NaverMap from "../NaverMap";
import { useLang } from "../../LangContext";
import type { Lang } from "../../i18n";
import type { Restaurant } from "../../types/restaurant";

import { useFilterState } from "./hooks/useFilterState";
import { useShopModal } from "./hooks/useShopModal";
import { useSearchModal } from "./hooks/useSearchModal";
import { useToast } from "./hooks/useToast";
import { useRollState } from "./hooks/useRollState";
import { useMarkerMode } from "./hooks/useMarkerMode";
import { useLangMenu } from "./hooks/useLangMenu";
import { useCopyToast } from "./hooks/useCopyToast";
import { useSortDropdown } from "./hooks/useSortDropdown";
import { useFilterSheet } from "./hooks/useFilterSheet";
import { useMenuScroll } from "./hooks/useMenuScroll";

import HeaderSection from "./components/HeaderSection";
import FilterBar from "./components/FilterBar";
import FilterSheet from "./components/FilterSheet";
import MenuView from "./components/MenuView";
import SearchModal from "./components/SearchModal";
import ShopDetailModal from "./components/ShopDetailModal";
import Confetti from "./components/Confetti";
import MapAnimations from "./components/MapAnimations";
import MarkerIsland from "./components/MarkerIsland";
import RollBar from "./components/RollBar";
import TabFab from "./components/TabFab";
import LangDropdown from "./components/LangDropdown";
import ToastStack from "./components/ToastStack";

export default function MapSelector() {
  const { lang, setLang } = useLang();

  const {
    filters,
    maxPrice,
    setMaxPrice,
    searchQuery,
    setSearchQuery,
    filteredList,
    sortedList,
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
    filterSheetOpen,
    filterSheetClosing,
    openFilterSheet,
    closeFilterSheet,
  } = useFilterSheet();

  const [focusTarget, setFocusTarget] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState<"map" | "menu">("menu");
  const [menuFilterBarHeight, setMenuFilterBarHeight] = useState(160);
  const [headerHeight, setHeaderHeight] = useState(70);
  const [showHint1, setShowHint1] = useState(false);

  const headerRowRef = useRef<HTMLDivElement | null>(null);

  const { isMenuScrolled, onScrollRefReady } = useMenuScroll(
    filteredList,
    sortedList,
  );

  const {
    rolledId,
    rolledMenuKey,
    confettiTrigger,
    rolledRestaurant,
    rolledMenuRestaurant,
    rolledMenuIdSet,
    handleRoll,
    handleRollMenu,
    handleUnroll,
  } = useRollState({
    filteredList,
    filteredMenuIds,
    setMarkerModes,
    setFocusTarget,
  });

  const handleClearPrice = () => {
    setMaxPrice(null);
  };
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchInput("");
  };

  const handleApplySearch = (input: string, target: "name" | "menu") => {
    const count = applySearch(input, target, setMarkerModes, setFocusTarget);
    if (count > 0) {
      closeSearchModal();
      setMarkerIslandOpen(false);
    } else showToast("검색 결과가 없습니다");
  };

  const displayList = rolledRestaurant
    ? [rolledRestaurant]
    : rolledMenuRestaurant
      ? [rolledMenuRestaurant]
      : filteredList;
  const displayMenuIds = rolledRestaurant
    ? null
    : rolledMenuKey
      ? rolledMenuIdSet
      : filteredMenuIds;
  const menuViewList = rolledRestaurant
    ? [rolledRestaurant]
    : rolledMenuRestaurant
      ? [rolledMenuRestaurant]
      : sortedList;

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
            isRolled={!!rolledRestaurant || !!rolledMenuRestaurant}
            sortOrder={sortOrder}
            menuFilterBarHeight={menuFilterBarHeight + 8}
            scrollPaddingTop={menuFilterBarHeight + 8}
            scrollPaddingBottom={80}
            onScrollRefReady={onScrollRefReady}
            onRestaurantClick={openShopModal}
          />
        </div>
      )}

      <RollBar
        lang={lang}
        filteredCount={filteredList.length}
        isUnrollable={rolledId !== null || rolledMenuKey !== null}
        onRoll={handleRoll}
        onRollMenu={handleRollMenu}
        onUnroll={handleUnroll}
      />
      <TabFab
        lang={lang}
        activeTab={activeTab}
        onTabToggle={() => setActiveTab((v) => (v === "map" ? "menu" : "map"))}
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
          isClosing={filterSheetClosing}
        />
      )}

      <Confetti trigger={confettiTrigger} />
    </div>
  );
}
