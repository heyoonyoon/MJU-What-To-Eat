import { useRef, useMemo } from "react";
import type { Restaurant } from "../../../types/restaurant";
import ShopCardList from "./ShopCardList";
import MenuCardList from "./MenuCardList";
import { useShuffledMenuItems } from "../hooks/useShuffledMenuItems";

type Props = {
  filteredList: Restaurant[];
  filteredMenuIds: Set<string> | null;
  menuFilterBarHeight: number;
  scrollPaddingTop: number;
  scrollPaddingBottom: number;
  sortOrder?: "default" | "priceLow" | "priceHigh";
  isRolled?: boolean;
  skipAnimation?: boolean;
  onScrollRefReady: (node: HTMLDivElement | null) => void;
  onRestaurantClick: (r: Restaurant) => void;
};

export default function MenuView({
  filteredList,
  filteredMenuIds,
  menuFilterBarHeight,
  scrollPaddingTop,
  scrollPaddingBottom,
  sortOrder,
  isRolled,
  skipAnimation,
  onScrollRefReady,
  onRestaurantClick,
}: Props) {
  // filteredMenuIds === null: 가게명 검색 → 가게 카드 모드
  const isRestaurantMode = filteredMenuIds === null;

  const baseMenuItems = useMemo(
    () =>
      isRestaurantMode
        ? []
        : filteredList.flatMap((r) =>
            (r.menus || [])
              .filter((m) =>
                (filteredMenuIds as Set<string>).has(`${r.id}-${m.menuId}`),
              )
              .map((m) => ({ restaurant: r, menu: m })),
          ),
    [filteredList, filteredMenuIds, isRestaurantMode],
  );

  const allMenuItems = useShuffledMenuItems(baseMenuItems, sortOrder);

  // scroll 컨테이너 ref: 자식 컴포넌트가 직접 구독하여 virtual scroll 계산
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99,
        background: "#f2f2f7",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: skipAnimation
          ? "none"
          : "menuViewFadeIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
      }}
    >
      {/* 스크롤 컨테이너 */}
      <div
        ref={(node) => {
          scrollRef.current = node;
          onScrollRefReady(node);
        }}
        data-scroll
        style={{
          flex: 1,
          overflowY: "auto",
          paddingTop: scrollPaddingTop,
          paddingBottom: scrollPaddingBottom,
          // 스크롤 합성 최적화 (layout/paint 격리, size는 제외 — padding 때문)
          contain: "content",
        }}
      >
        {isRestaurantMode ? (
          <ShopCardList
            filteredList={filteredList}
            menuFilterBarHeight={menuFilterBarHeight}
            scrollRef={scrollRef}
            onRestaurantClick={onRestaurantClick}
            isRolled={isRolled}
          />
        ) : (
          <MenuCardList
            allMenuItems={allMenuItems}
            menuFilterBarHeight={menuFilterBarHeight}
            scrollRef={scrollRef}
            onRestaurantClick={onRestaurantClick}
            isRolled={isRolled}
          />
        )}
      </div>
    </div>
  );
}
