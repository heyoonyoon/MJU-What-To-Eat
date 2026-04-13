import { useState, useMemo } from "react";
import type { Restaurant } from "../data";
import { restaurants } from "../data";
import { FilterPanel } from "./FilterPanel";
import { RollButton } from "./RollButton";
import { ResultGrid } from "./ResultGrid";
import NaverMap from "./NaverMap";

export default function MapSelector() {
  const [filters, setFilters] = useState<{
    type: string[];
    cat: string[];
    zone: string[];
    solo: string[];
  }>({
    type: [],
    cat: ["전체"],
    zone: [], // 아무 구역도 선택되지 않은 상태로 시작
    solo: [],
  });
  const [picked, setPicked] = useState<Restaurant[]>([]);
  const [hasRolled, setHasRolled] = useState(false);
  const [mapDisplayList, setMapDisplayList] =
    useState<Restaurant[]>(restaurants);
  const [cardDisplayList, setCardDisplayList] =
    useState<Restaurant[]>(restaurants);

  // ── 필터링 로직 ──
  const filteredList = useMemo<Restaurant[]>(() => {
    return restaurants.filter((r) => {
      const typeOk = filters.type.length === 0 || filters.type.includes(r.type);
      const catOk =
        filters.cat.length === 0 ||
        filters.cat.includes("전체") ||
        filters.cat.includes(r.category);
      const zoneOk = filters.zone.length === 0 || filters.zone.includes(r.zone); // 구역 선택 없이도 조회 가능
      const soloOk = filters.solo.length === 0 ? true : r.solo;
      return typeOk && catOk && zoneOk && soloOk;
    });
  }, [filters]);

  // ── 필터 토글 핸들러 ──
  const toggleFilter = (
    key: "type" | "cat" | "zone" | "solo",
    value: string,
  ) => {
    setPicked([]);
    setHasRolled(false);
    setFilters((prev) => {
      // 음식 필터에서 "전체" 선택 시 특별 처리
      if (key === "cat" && value === "전체") {
        return {
          ...prev,
          [key]: prev[key].includes(value) ? [] : ["전체"],
        };
      }

      // 음식 필터에서 다른 항목 선택 시 "전체" 제거
      if (key === "cat" && value !== "전체") {
        const newCat = prev[key].includes(value)
          ? prev[key].filter((v) => v !== value)
          : [...prev[key].filter((v) => v !== "전체"), value];
        return { ...prev, [key]: newCat };
      }

      // 기본 토글 로직
      return {
        ...prev,
        [key]: prev[key].includes(value)
          ? prev[key].filter((v) => v !== value)
          : [...prev[key], value],
      };
    });
  };

  // ── 필터 초기화 ──
  const resetFilters = () => {
    setFilters({ type: [], cat: ["전체"], zone: [], solo: [] });
  };

  // ── 랜덤 선택 ──
  const handleRoll = () => {
    const shuffled = [...filteredList].sort(() => 0.5 - Math.random());
    const result = shuffled.slice(0, 1);
    setPicked(result);
    setMapDisplayList(result);
    setCardDisplayList(result);
    setHasRolled(true);
  };

  // ── 전체 조회 ──
  const handleViewAll = () => {
    setPicked(filteredList);
    setMapDisplayList(filteredList);
    setCardDisplayList(filteredList);
    setHasRolled(true);
  };

  return (
    <div
      className="bg-gray-50 text-gray-900 font-sans pb-28"
      style={{
        minHeight: "100dvh",
        paddingBottom: "calc(env(safe-area-inset-bottom, 1.5rem) + 9rem)",
      }}
    >
      {/* Header */}
      <header className="bg-white border-b border-gray-200 text-center py-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          명지대 오늘 뭐 먹지?
        </h1>
      </header>

      {/* Map Zone */}
      {/* <MapZone filters={filters} onToggleFilter={toggleFilter} /> */}
      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onToggleFilter={toggleFilter}
        onReset={resetFilters}
      />
      {/* Roll Button */}
      <RollButton
        countAvailable={filteredList.length}
        onRoll={handleRoll}
        onViewAll={handleViewAll}
      />

      <NaverMap displayList={mapDisplayList} />
      {/* Result Grid */}
      <ResultGrid
        picked={picked}
        hasRolled={hasRolled}
        filteredList={cardDisplayList}
      />
    </div>
  );
}
