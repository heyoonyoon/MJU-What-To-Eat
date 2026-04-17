import { useState, useMemo, useCallback } from "react";
import { restaurants } from "../../../data2";
import type { Restaurant } from "../../../types/restaurant";
import type { MarkerModeKey, MarkerModes } from "../../NaverMap";
import { applyTagFilter, applyPriceFilter } from "../utils";

export type Filters = {
  type: string[];
  cat: string[];
  zone: string[];
  tags: string[];
};

export type SortOrder = "default" | "priceLow" | "priceHigh";

export function useFilterState() {
  const [filters, setFilters] = useState<Filters>({
    type: [],
    cat: ["전체"],
    zone: [],
    tags: [],
  });
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedTarget, setAppliedTarget] = useState<"name" | "menu">("menu");
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");

  // 필터만 적용 (정렬 제외) — 지도 마커용
  const filteredList = useMemo<Restaurant[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    const menuQ = q && appliedTarget === "menu" ? q : undefined;
    return restaurants.filter((r) => {
      const typeOk = filters.type.length === 0 || filters.type.includes(r.type);
      const catOk =
        filters.cat.includes("전체") || filters.cat.includes(r.category);
      const zoneOk = filters.zone.length === 0 || filters.zone.includes(r.zone);
      const tagsOk = applyTagFilter(r, filters.tags);
      const priceOk = applyPriceFilter(r, maxPrice, menuQ);
      if (!typeOk || !catOk || !zoneOk || !tagsOk || !priceOk) return false;
      if (!q) return true;
      if (appliedTarget === "name") return r.name.toLowerCase().includes(q);
      return (r.menus || []).some((m) =>
        Object.values(m.name).some((v) => v.toLowerCase().includes(q)),
      );
    });
  }, [filters, maxPrice, searchQuery, appliedTarget]);

  // 정렬 적용 — 리스트/메뉴판용
  const sortedList = useMemo<Restaurant[]>(() => {
    if (sortOrder === "priceLow") {
      return [...filteredList].sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
    }
    if (sortOrder === "priceHigh") {
      return [...filteredList].sort((a, b) => (b.minPrice ?? -Infinity) - (a.minPrice ?? -Infinity));
    }
    return filteredList;
  }, [filteredList, sortOrder]);

  // 메뉴판에서 표시할 메뉴를 정확히 필터링하기 위한 매칭 메뉴 ID 세트
  // - 가게명 검색 시: null (가게 카드 모드)
  // - 메뉴명 검색 또는 가격/태그 필터 시: 조건에 맞는 menuId 세트
  const filteredMenuIds = useMemo<Set<string> | null>(() => {
    const q = searchQuery.trim().toLowerCase();
    // 가게명 검색 모드: 메뉴 카드 대신 가게 카드 표시
    if (q && appliedTarget === "name") return null;
    // 메뉴 검색도 없고 가격 필터도 없으면 전체 메뉴 ID 세트 반환 (메뉴 그리드 기본)
    if (!q && maxPrice == null) {
      const all = new Set<string>();
      filteredList.forEach((r) => (r.menus || []).forEach((m) => all.add(`${r.id}-${m.menuId}`)));
      return all;
    }

    const ids = new Set<string>();
    filteredList.forEach((r) => {
      (r.menus || []).forEach((m) => {
        const menuNameMatch =
          !q ||
          Object.values(m.name).some((v) => v.toLowerCase().includes(q));
        const priceOk = maxPrice == null || (m.price != null && m.price <= maxPrice);
        if (menuNameMatch && priceOk) {
          ids.add(`${r.id}-${m.menuId}`);
        }
      });
    });
    return ids;
  }, [filteredList, searchQuery, appliedTarget, maxPrice]);

  const toggleFilter = useCallback(
    (key: "type" | "cat" | "zone" | "tags", value: string) => {
      setFilters((prev) => {
        let next: Filters;
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
    },
    [],
  );

  const clearTagFilters = useCallback(() => {
    setFilters((prev) => ({ ...prev, tags: [] }));
    setMaxPrice(null);
  }, []);

  const applyFilterSheet = useCallback(
    (cat: string[], tags: string[]) => {
      setFilters((prev) => ({ ...prev, cat, tags }));
    },
    [],
  );

  const applySearch = useCallback(
    (
      query: string,
      target: "name" | "menu",
      setMarkerModes: React.Dispatch<React.SetStateAction<MarkerModes>>,
      setFocusTarget: React.Dispatch<React.SetStateAction<Restaurant | null>>,
    ): number => {
      const q = query.trim().toLowerCase();
      const menuQ = q && target === "menu" ? q : undefined;
      const matched = q
        ? restaurants.filter((r) => {
            const typeOk =
              filters.type.length === 0 || filters.type.includes(r.type);
            const catOk =
              filters.cat.includes("전체") || filters.cat.includes(r.category);
            const zoneOk =
              filters.zone.length === 0 || filters.zone.includes(r.zone);
            const tagsOk = applyTagFilter(r, filters.tags);
            const priceOk = applyPriceFilter(r, maxPrice, menuQ);
            if (!typeOk || !catOk || !zoneOk || !tagsOk || !priceOk)
              return false;
            if (target === "name") return r.name.toLowerCase().includes(q);
            return (r.menus || []).some((m) =>
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
        if (matched.length > 0) setFocusTarget(matched[0]);
      }
      return matched.length;
    },
    [filters, maxPrice],
  );

  return {
    filters,
    maxPrice,
    setMaxPrice,
    searchQuery,
    setSearchQuery,
    appliedTarget,
    filteredList,
    sortedList,
    filteredMenuIds,
    toggleFilter,
    clearTagFilters,
    applyFilterSheet,
    applySearch,
    sortOrder,
    setSortOrder,
  };
}
