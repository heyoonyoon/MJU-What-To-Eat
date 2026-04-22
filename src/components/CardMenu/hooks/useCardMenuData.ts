import { restaurants } from "../../../data2";
import type { CardItem } from "./useCardDeck";

function buildShuffledItems(): CardItem[] {
  const items: CardItem[] = [];
  for (const r of restaurants) {
    if (!r.menus) continue;
    for (const m of r.menus) {
      items.push({ restaurant: r, menu: m });
    }
  }
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

// Shuffled once at module load — safe to use as a stable reference in hooks
const shuffledItems = buildShuffledItems();

export function useCardMenuData(): CardItem[] {
  return shuffledItems;
}
