import type { CardItem } from "../hooks/useCardDeck";

const CARD_COLORS = [
  "#5B8CFF",
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#FF922B",
  "#CC5DE8",
  "#20C997",
  "#F06595",
];

export const cardColor = (item: CardItem): string => {
  const idx =
    Math.abs(
      item.restaurant.id.charCodeAt(0) + (item.menu.menuId.charCodeAt(0) || 0),
    ) % CARD_COLORS.length;
  return CARD_COLORS[idx];
};
