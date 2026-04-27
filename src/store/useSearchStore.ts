import { create } from "zustand";
import { restaurants } from "../data2";
import type { Restaurant } from "../types/restaurant";
import {
  applyTagFilter,
  applyPriceFilter,
} from "../components/MapSelector/utils";

export type Filters = {
  type: string[];
  cat: string[];
  zone: string[];
  tags: string[];
};

export type SortOrder = "default" | "priceLow" | "priceHigh";

const INITIAL_FILTERS: Filters = {
  type: [],
  cat: ["전체"],
  zone: [],
  tags: [],
};

function computeFilteredList(
  filters: Filters,
  maxPrice: number | null,
  searchQuery: string,
  appliedTarget: "name" | "menu",
): Restaurant[] {
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
}

function computeFilteredMenuIds(
  filteredList: Restaurant[],
  searchQuery: string,
  appliedTarget: "name" | "menu",
  maxPrice: number | null,
): Set<string> | null {
  const q = searchQuery.trim().toLowerCase();
  if (q && appliedTarget === "name") return null;
  if (!q && maxPrice == null) {
    const all = new Set<string>();
    filteredList.forEach((r) =>
      (r.menus || []).forEach((m) => all.add(`${r.id}-${m.menuId}`)),
    );
    return all;
  }
  const ids = new Set<string>();
  filteredList.forEach((r) => {
    (r.menus || []).forEach((m) => {
      const menuNameMatch =
        !q || Object.values(m.name).some((v) => v.toLowerCase().includes(q));
      const priceOk =
        maxPrice == null || (m.price != null && m.price <= maxPrice);
      if (menuNameMatch && priceOk) ids.add(`${r.id}-${m.menuId}`);
    });
  });
  return ids;
}

const initialFilteredList = computeFilteredList(
  INITIAL_FILTERS,
  null,
  "",
  "menu",
);
const initialFilteredMenuIds = computeFilteredMenuIds(
  initialFilteredList,
  "",
  "menu",
  null,
);

interface SearchState {
  filters: Filters;
  maxPrice: number | null;
  searchQuery: string;
  appliedTarget: "name" | "menu";
  sortOrder: SortOrder;
  filteredList: Restaurant[];
  filteredMenuIds: Set<string> | null;

  setSearchQuery: (q: string, target: "name" | "menu") => void;
  setMaxPrice: (p: number | null) => void;
  setSortOrder: (o: SortOrder) => void;
  applyFilterSheet: (cat: string[], tags: string[]) => void;
  clearTagFilters: () => void;
  toggleFilter: (key: keyof Filters, value: string) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: INITIAL_FILTERS,
  maxPrice: null,
  searchQuery: "",
  appliedTarget: "menu",
  sortOrder: "default",
  filteredList: initialFilteredList,
  filteredMenuIds: initialFilteredMenuIds,

  setSearchQuery: (q, target) =>
    set((prev) => {
      const filteredList = computeFilteredList(
        prev.filters,
        prev.maxPrice,
        q,
        target,
      );
      return {
        searchQuery: q,
        appliedTarget: target,
        filteredList,
        filteredMenuIds: computeFilteredMenuIds(
          filteredList,
          q,
          target,
          prev.maxPrice,
        ),
      };
    }),

  setMaxPrice: (p) =>
    set((prev) => {
      const filteredList = computeFilteredList(
        prev.filters,
        p,
        prev.searchQuery,
        prev.appliedTarget,
      );
      return {
        maxPrice: p,
        filteredList,
        filteredMenuIds: computeFilteredMenuIds(
          filteredList,
          prev.searchQuery,
          prev.appliedTarget,
          p,
        ),
      };
    }),

  setSortOrder: (o) => set({ sortOrder: o }),

  applyFilterSheet: (cat, tags) =>
    set((prev) => {
      const newFilters = { ...prev.filters, cat, tags };
      const filteredList = computeFilteredList(
        newFilters,
        prev.maxPrice,
        prev.searchQuery,
        prev.appliedTarget,
      );
      return {
        filters: newFilters,
        filteredList,
        filteredMenuIds: computeFilteredMenuIds(
          filteredList,
          prev.searchQuery,
          prev.appliedTarget,
          prev.maxPrice,
        ),
      };
    }),

  clearTagFilters: () =>
    set((prev) => {
      const newFilters = { ...prev.filters, tags: [] };
      const filteredList = computeFilteredList(
        newFilters,
        null,
        prev.searchQuery,
        prev.appliedTarget,
      );
      return {
        filters: newFilters,
        maxPrice: null,
        filteredList,
        filteredMenuIds: computeFilteredMenuIds(
          filteredList,
          prev.searchQuery,
          prev.appliedTarget,
          null,
        ),
      };
    }),

  toggleFilter: (key, value) =>
    set((prev) => {
      let newFilters: Filters;
      if (key === "cat" && value === "전체") {
        newFilters = { ...prev.filters, cat: ["전체"] };
      } else if (key === "cat") {
        const newCat = prev.filters.cat.includes(value)
          ? prev.filters.cat.filter((v) => v !== value)
          : [...prev.filters.cat.filter((v) => v !== "전체"), value];
        newFilters = {
          ...prev.filters,
          cat: newCat.length === 0 ? ["전체"] : newCat,
        };
      } else {
        newFilters = {
          ...prev.filters,
          [key]: prev.filters[key].includes(value)
            ? prev.filters[key].filter((v) => v !== value)
            : [...prev.filters[key], value],
        };
      }
      const filteredList = computeFilteredList(
        newFilters,
        prev.maxPrice,
        prev.searchQuery,
        prev.appliedTarget,
      );
      return {
        filters: newFilters,
        filteredList,
        filteredMenuIds: computeFilteredMenuIds(
          filteredList,
          prev.searchQuery,
          prev.appliedTarget,
          prev.maxPrice,
        ),
      };
    }),

  reset: () =>
    set({
      filters: INITIAL_FILTERS,
      maxPrice: null,
      searchQuery: "",
      appliedTarget: "menu",
      sortOrder: "default",
      filteredList: initialFilteredList,
      filteredMenuIds: initialFilteredMenuIds,
    }),
}));
