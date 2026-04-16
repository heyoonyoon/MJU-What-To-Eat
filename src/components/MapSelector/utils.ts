import type { Restaurant } from "../../data2";

// Y축: 일반 저항 / X축: 강한 저항 (살짝만 움직임)
export const resistY = (delta: number) => {
  const sign = delta < 0 ? -1 : 1;
  return sign * Math.pow(Math.abs(delta), 0.65) * 2.2;
};

export const resistX = (delta: number) => {
  const sign = delta < 0 ? -1 : 1;
  return sign * Math.pow(Math.abs(delta), 0.4) * 1.2;
};

export const applyTagFilter = (r: Restaurant, tags: string[]): boolean => {
  if (tags.length === 0) return true;
  return tags.every((tag) => {
    if (tag === "👤 혼밥") return r.solo;
    if (tag === "💪 고단백") return r.filters.isHighProtein;
    if (tag === "🥗 건강식") return r.filters.isHealthy;
    return true;
  });
};

export const applyPriceFilter = (
  r: Restaurant,
  mp: number | null,
): boolean => {
  if (mp === null) return true;
  if (r.minPrice === null) return false;
  return r.minPrice <= mp;
};
