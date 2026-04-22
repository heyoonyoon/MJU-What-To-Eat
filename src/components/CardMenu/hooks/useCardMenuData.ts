import { useMemo } from "react";
import { restaurants } from "../../../data2";
import type { CardItem } from "./useCardDeck";

export function useCardMenuData(): CardItem[] {
  return useMemo(() => {
    const items: CardItem[] = [];
    for (const r of restaurants) {
      if (!r.menus) continue;
      for (const m of r.menus) {
        items.push({ restaurant: r, menu: m });
      }
    }
    // Fisher-Yates shuffle — called once at mount, outside render
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — shuffle once on mount
}
