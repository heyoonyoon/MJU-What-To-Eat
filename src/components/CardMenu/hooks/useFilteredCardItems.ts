import { useRef } from "react";
import { useSearchStore } from "../../../store/useSearchStore";
import type { CardItem } from "./useCardDeck";
import type { Restaurant } from "../../../types/restaurant";

function buildShuffled(
  filteredList: Restaurant[],
  filteredMenuIds: Set<string> | null,
): CardItem[] {
  const items: CardItem[] = [];
  for (const r of filteredList) {
    if (!r.menus) continue;
    for (const m of r.menus) {
      const key = `${r.id}-${m.menuId}`;
      if (filteredMenuIds === null || filteredMenuIds.has(key)) {
        items.push({ restaurant: r, menu: m });
      }
    }
  }
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export const useFilteredCardItems = (): CardItem[] => {
  const { filteredList, filteredMenuIds, sortOrder } = useSearchStore();

  const prevFilteredRef = useRef<typeof filteredList | null>(null);
  const shuffledRef = useRef<CardItem[]>([]);

  if (filteredList !== prevFilteredRef.current) {
    prevFilteredRef.current = filteredList;
    shuffledRef.current = buildShuffled(filteredList, filteredMenuIds);
  }

  if (sortOrder === "priceLow") {
    return [...shuffledRef.current].sort(
      (a, b) => (a.menu.price ?? Infinity) - (b.menu.price ?? Infinity),
    );
  }
  if (sortOrder === "priceHigh") {
    return [...shuffledRef.current].sort(
      (a, b) => (b.menu.price ?? -Infinity) - (a.menu.price ?? -Infinity),
    );
  }
  return shuffledRef.current;
};
