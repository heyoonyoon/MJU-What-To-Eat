import { useRef, useState, useCallback } from "react";
import { useLang } from "../../LangContext";
import { useSearchStore } from "../../store/useSearchStore";
import { useCardDeck } from "./hooks/useCardDeck";
import { useFilteredCardItems } from "./hooks/useFilteredCardItems";
import { useLangMenu } from "../MapSelector/hooks/useLangMenu";
import { useSortDropdown } from "../MapSelector/hooks/useSortDropdown";
import { useSearchModal } from "../MapSelector/hooks/useSearchModal";
import { useBottomSheet } from "../MapSelector/hooks/useBottomSheet";
import { useToast } from "../MapSelector/hooks/useToast";
import { useCopyToast } from "../MapSelector/hooks/useCopyToast";
import { applyTagFilter, applyPriceFilter } from "../MapSelector/utils";
import CardDeck, { type CardDeckHandle } from "./components/CardDeck";
import BottomTabBar, { type BottomTab } from "../BottomTabBar";
import HeaderSection from "../MapSelector/components/HeaderSection";
import FilterBar from "../MapSelector/components/FilterBar";
import FilterSheet from "../MapSelector/components/FilterSheet";
import SearchModal from "../MapSelector/components/SearchModal";
import ShopDetailModal from "../MapSelector/components/ShopDetailModal";
import MapAnimations from "../MapSelector/components/MapAnimations";
import LangDropdown from "../MapSelector/components/LangDropdown";
import ToastStack from "../MapSelector/components/ToastStack";
import type { Restaurant } from "../../types/restaurant";
import type { Lang } from "../../i18n";
import { restaurants } from "../../data2";
import type { MarkerModeKey, MarkerModes } from "../NaverMap";

type Props = {
  onTabChange: (tab: BottomTab) => void;
};

const CardMenu = ({ onTabChange }: Props) => {
  const { lang, setLang } = useLang();
  const {
    filters,
    maxPrice,
    setMaxPrice,
    searchQuery,
    setSearchQuery,
    appliedTarget,
    toggleFilter,
    applyFilterSheet,
    sortOrder,
    setSortOrder,
  } = useSearchStore();

  const cards = useFilteredCardItems();
  const { orderedCards, offset, advance, goBack } = useCardDeck(cards);
  const deckRef = useRef<CardDeckHandle>(null);

  // 가게 상세 모달
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

  const { langMenuOpen, langMenuVisible, langMenuPos, langBtnRef, openLangMenu, closeLangMenu } = useLangMenu();
  const { sortDropdownOpen, sortDropdownVisible, sortDropdownPos, sortBtnRef, openSortDropdownSafe, closeSortDropdown } = useSortDropdown();
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
  const {
    isOpen: filterSheetOpen,
    open: openFilterSheet,
    close: closeFilterSheet,
    onSheetReady: filterSheetReady,
    onOverlayReady: filterOverlayReady,
    onDragStart: filterSheetDragStart,
  } = useBottomSheet();
  const { toasts, showToast } = useToast();
  const { showCopyToast } = useCopyToast(lang, showToast);

  const [headerHeight, setHeaderHeight] = useState(70);
  const [menuFilterBarHeight, setMenuFilterBarHeight] = useState(120);
  const [showHint1] = useState(false);
  const headerRowRef = useRef<HTMLDivElement | null>(null);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("", "menu");
    setSearchInput("");
  }, [setSearchQuery, setSearchInput]);

  const handleClearPrice = useCallback(() => {
    setMaxPrice(null);
  }, [setMaxPrice]);

  const handleApplySearch = useCallback((input: string, target: "name" | "menu") => {
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

    // 카드 페이지에선 마커 모드 변경 불필요, 검색만 적용
    void (null as unknown as MarkerModeKey);
    void (null as unknown as MarkerModes);
    closeSearchModal();
  }, [filters, maxPrice, setSearchQuery, showToast, closeSearchModal]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#f2f2f7",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <MapAnimations />
      <div
        style={{
          flex: 1,
          padding: `${menuFilterBarHeight + 16}px 40px 80px`,
          position: "relative",
          minHeight: 0,
        }}
      >
        <CardDeck
          ref={deckRef}
          cards={orderedCards}
          lang={lang}
          onAdvance={(dir) => (dir === 1 ? advance() : goBack())}
          onCardClick={(item) => openShopModal(item.restaurant)}
          isAtStart={offset === 0}
        />
      </div>
      <BottomTabBar activeTab="cards" onTabChange={onTabChange} />

      {/* 헤더 + 필터바 레이어 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 500,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 12,
            right: 12,
            borderRadius: 24,
            height: menuFilterBarHeight,
            background: "linear-gradient(160deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 100%)",
            backdropFilter: "blur(28px) saturate(180%) brightness(1.04)",
            WebkitBackdropFilter: "blur(28px) saturate(180%) brightness(1.04)",
            border: "1px solid rgba(255,255,255,0.45)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
            pointerEvents: "none",
          }}
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
          onDismissHint={() => {}}
          onOpenLangMenu={openLangMenu}
          onCloseLangMenu={closeLangMenu}
          onHeaderResize={setHeaderHeight}
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
          isMapTab={false}
        />
      </div>

      {langMenuOpen && (
        <LangDropdown
          lang={lang}
          langMenuVisible={langMenuVisible}
          langMenuPos={langMenuPos}
          onClose={closeLangMenu}
          onSelect={(l: Lang) => { setLang(l); closeLangMenu(); }}
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

      {filterSheetOpen && (
        <FilterSheet
          filters={filters}
          maxPrice={maxPrice}
          onApply={(localFilters, localMaxPrice) => {
            applyFilterSheet(localFilters.cat, localFilters.tags);
            if (localMaxPrice === null) handleClearPrice();
            else setMaxPrice(localMaxPrice);
            closeFilterSheet();
          }}
          onClose={closeFilterSheet}
          onSheetReady={filterSheetReady}
          onOverlayReady={filterOverlayReady}
          onDragStart={filterSheetDragStart}
        />
      )}

      {selectedRestaurant && shopSheetOpen && (
        <ShopDetailModal
          restaurant={selectedRestaurant}
          isScrolledToBottom={isScrolledToBottom}
          modalScrollRef={modalScrollRef}
          onClose={closeShopModal}
          onModalScroll={handleModalScroll}
          onSheetReady={shopSheetReady}
          onOverlayReady={shopOverlayReady}
          onDragStart={shopDragStart}
          onScrollAreaTouchStart={onScrollAreaTouchStart}
          onCopyToast={showCopyToast}
        />
      )}
    </div>
  );
};

export default CardMenu;
