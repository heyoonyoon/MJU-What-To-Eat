import { useState, useCallback } from "react";
import type { Restaurant, Menu } from "../../../types/restaurant";

export type CardItem = {
  restaurant: Restaurant;
  menu: Menu;
};

export function useCardDeck(cards: CardItem[]) {
  const [offset, setOffset] = useState(0);

  const advance = useCallback(() => {
    setOffset((o) => (o + 1) % cards.length);
  }, [cards.length]);

  const goBack = useCallback(() => {
    setOffset((o) => (o - 1 + cards.length) % cards.length);
  }, [cards.length]);

  const reset = useCallback(() => setOffset(0), []);

  // 현재 스택 순서: offset부터 순환
  const orderedCards =
    cards.length === 0
      ? []
      : Array.from(
          { length: cards.length },
          (_, i) => cards[(offset + i) % cards.length],
        );

  return { orderedCards, offset, advance, goBack, reset };
}
