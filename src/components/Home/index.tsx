import { useLang } from "../../LangContext";
import { t } from "../../i18n";
import { useSearchStore } from "../../store/useSearchStore";
import { useHomeActions } from "./hooks/useHomeActions";
import HomeSearchBar from "./components/HomeSearchBar";
import HomeFilterButton from "./components/HomeFilterButton";
import HomeStartButton from "./components/HomeStartButton";
import FilterSheet from "../MapSelector/components/FilterSheet";
import SearchModal from "../MapSelector/components/SearchModal";

type Props = {
  onStart: () => void;
};

const Home = ({ onStart }: Props) => {
  const { lang } = useLang();
  const T = t[lang];
  const { filteredList, searchQuery } = useSearchStore();

  const {
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
  } = useHomeActions();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#f2f2f7",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        gap: "16px",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 900,
          color: "#111",
          margin: 0,
          textAlign: "center",
        }}
      >
        {T.appTitle}
      </h1>

      <HomeSearchBar
        searchQuery={searchQuery}
        onClick={() => {
          setSearchInput(searchQuery);
          setSearchModalOpen(true);
        }}
        onClear={handleClearSearch}
      />

      <HomeFilterButton
        filters={filters}
        maxPrice={maxPrice}
        onClick={openFilterSheet}
      />

      <HomeStartButton count={filteredList.length} onClick={onStart} />

      {filterSheetOpen && (
        <FilterSheet
          filters={filters}
          maxPrice={maxPrice}
          onApply={handleApplyFilter}
          onClose={closeFilterSheet}
          onSheetReady={filterSheetReady}
          onOverlayReady={filterOverlayReady}
          onDragStart={filterSheetDragStart}
        />
      )}

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
    </div>
  );
};

export default Home;
