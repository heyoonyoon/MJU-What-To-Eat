import type { Restaurant } from "../../../data2";
import ShopCardList from "./ShopCardList";
import MenuCardList from "./MenuCardList";

type Props = {
  filteredList: Restaurant[];
  filteredMenuIds: Set<string> | null;
  menuScrollTop: number;
  menuContainerHeight: number;
  menuContainerWidth: number;
  menuFilterBarHeight: number;
  scrollPaddingTop: number;
  scrollPaddingBottom: number;
  onScrollRefReady: (node: HTMLDivElement | null) => void;
  onScrollTopChange: (top: number) => void;
  onContainerResize: (height: number, width: number) => void;
  onRestaurantClick: (r: Restaurant) => void;
};

export default function MenuView({
  filteredList,
  filteredMenuIds,
  menuScrollTop,
  menuContainerHeight,
  menuContainerWidth,
  menuFilterBarHeight,
  scrollPaddingTop,
  scrollPaddingBottom,
  onScrollRefReady,
  onScrollTopChange,
  onContainerResize,
  onRestaurantClick,
}: Props) {
  // filteredMenuIds === null: 가게명 검색 → 가게 카드 모드
  const isRestaurantMode = filteredMenuIds === null;

  const allMenuItems = isRestaurantMode
    ? []
    : filteredList.flatMap((r) =>
        r.menus
          .filter((m) => filteredMenuIds.has(`${r.id}-${m.menuId}`))
          .map((m) => ({ restaurant: r, menu: m })),
      );

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
      }}
    >
      {/* 스크롤 컨테이너 */}
      <div
        ref={(node) => {
          onScrollRefReady(node);
          if (!node) return;
          onContainerResize(node.clientHeight, node.clientWidth);
          const ro = new ResizeObserver(() => {
            onContainerResize(node.clientHeight, node.clientWidth);
          });
          ro.observe(node);
          (node as HTMLDivElement & { _ro?: ResizeObserver })._ro?.disconnect();
          (node as HTMLDivElement & { _ro?: ResizeObserver })._ro = ro;
        }}
        onScroll={(e) =>
          onScrollTopChange((e.target as HTMLDivElement).scrollTop)
        }
        style={{
          flex: 1,
          overflowY: "auto",
          paddingTop: scrollPaddingTop,
          paddingBottom: scrollPaddingBottom,
        }}
      >
        {isRestaurantMode ? (
          <ShopCardList
            filteredList={filteredList}
            menuScrollTop={menuScrollTop}
            menuContainerHeight={menuContainerHeight}
            menuFilterBarHeight={menuFilterBarHeight}
            onRestaurantClick={onRestaurantClick}
          />
        ) : (
          <MenuCardList
            allMenuItems={allMenuItems}
            menuScrollTop={menuScrollTop}
            menuContainerHeight={menuContainerHeight}
            menuContainerWidth={menuContainerWidth}
            menuFilterBarHeight={menuFilterBarHeight}
            onRestaurantClick={onRestaurantClick}
          />
        )}
      </div>
    </div>
  );
}
