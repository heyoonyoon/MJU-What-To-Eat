import type { Restaurant } from "../../types/restaurant";

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
  menuSearchQuery?: string,
): boolean => {
  if (mp === null) return true;
  // 메뉴명 검색 중이면 매칭 메뉴들의 최소 가격 기준
  if (menuSearchQuery) {
    const q = menuSearchQuery.trim().toLowerCase();
    const matchedPrices = r.menus
      .filter((m) => Object.values(m.name).some((v) => v.toLowerCase().includes(q)))
      .map((m) => m.price)
      .filter((p): p is number => p != null);
    if (matchedPrices.length === 0) return false;
    return Math.min(...matchedPrices) <= mp;
  }
  if (r.minPrice === null) return false;
  return r.minPrice <= mp;
};
