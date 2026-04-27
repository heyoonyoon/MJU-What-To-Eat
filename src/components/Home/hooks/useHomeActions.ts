import { useSearchModal } from "../../MapSelector/hooks/useSearchModal";
import { useBottomSheet } from "../../MapSelector/hooks/useBottomSheet";
import { useSearchStore } from "../../../store/useSearchStore";

export const useHomeActions = () => {
  const { setSearchQuery, applyFilterSheet, setMaxPrice, filters, maxPrice } = useSearchStore();

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

  const handleApplySearch = (input: string, target: "name" | "menu") => {
    setSearchQuery(input, target);
    closeSearchModal();
  };

  const handleApplyFilter = (
    localFilters: { cat: string[]; tags: string[] },
    localMaxPrice: number | null,
  ) => {
    applyFilterSheet(localFilters.cat, localFilters.tags);
    setMaxPrice(localMaxPrice);
    closeFilterSheet();
  };

  const handleClearSearch = () => {
    setSearchQuery("", "menu");
    setSearchInput("");
  };

  return {
    filters,
    maxPrice,
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
    onSearchDragStart,
    onSearchDragMove,
    onSearchDragEnd,
    isSearchDragging,
    filterSheetOpen,
    openFilterSheet,
    closeFilterSheet,
    filterSheetReady,
    filterOverlayReady,
    filterSheetDragStart,
    handleApplySearch,
    handleApplyFilter,
    handleClearSearch,
  };
};
