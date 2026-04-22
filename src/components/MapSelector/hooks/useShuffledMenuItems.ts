import { useRef } from "react";
import type { Restaurant, Menu } from "../../../types/restaurant";

type MenuItem = { restaurant: Restaurant; menu: Menu };

function shuffle(arr: MenuItem[]): MenuItem[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function useShuffledMenuItems(
  base: MenuItem[],
  sortOrder: "default" | "priceLow" | "priceHigh" | undefined,
): MenuItem[] {
  const shuffledRef = useRef<MenuItem[]>([]);
  const prevBaseRef = useRef<MenuItem[]>([]);

  if (sortOrder === "priceLow") {
    return [...base].sort(
      (a, b) => (a.menu.price ?? Infinity) - (b.menu.price ?? Infinity),
    );
  }
  if (sortOrder === "priceHigh") {
    return [...base].sort(
      (a, b) => (b.menu.price ?? -Infinity) - (a.menu.price ?? -Infinity),
    );
  }

  // base 배열이 바뀔 때만 다시 셔플
  if (base !== prevBaseRef.current) {
    prevBaseRef.current = base;
    shuffledRef.current = shuffle(base);
  }
  return shuffledRef.current;
}
