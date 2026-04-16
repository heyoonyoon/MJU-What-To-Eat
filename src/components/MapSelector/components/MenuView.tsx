import React from "react";
import { useLang } from "../../../LangContext";
import { t } from "../../../i18n";
import type { Restaurant } from "../../../data2";
import ShopCardList from "./ShopCardList";
import MenuCardList from "./MenuCardList";

type Props = {
  filteredList: Restaurant[];
  filteredMenuIds: Set<string> | null;
  menuViewMode: "grid" | "list";
  menuScrollTop: number;
  menuContainerHeight: number;
  menuContainerWidth: number;
  menuFilterBarHeight: number;
  scrollPaddingTop: number;
  menuScrollRef: React.MutableRefObject<HTMLDivElement | null>;
  onScrollTopChange: (top: number) => void;
  onContainerResize: (height: number, width: number) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onRestaurantClick: (r: Restaurant) => void;
};

export default function MenuView({
  filteredList,
  filteredMenuIds,
  menuViewMode,
  menuScrollTop,
  menuContainerHeight,
  menuContainerWidth,
  menuFilterBarHeight,
  scrollPaddingTop,
  menuScrollRef,
  onScrollTopChange,
  onContainerResize,
  onViewModeChange,
  onRestaurantClick,
}: Props) {
  const { lang } = useLang();
  const T = t[lang];

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
        bottom: "56px",
        zIndex: 99,
        background: "#f2f2f7",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 뷰 전환 버튼 (가게 카드 모드에서는 숨김) */}
      {!isRestaurantMode && (
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            right: "16px",
            zIndex: 106,
            display: "flex",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: "10px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {(["grid", "list"] as const).map((mode) => {
            const isActive = menuViewMode === mode;
            return (
              <button
                key={mode}
                onClick={() => {
                  onViewModeChange(mode);
                  menuScrollRef.current?.scrollTo(0, 0);
                  onScrollTopChange(0);
                }}
                style={{
                  padding: "7px 14px",
                  background: isActive ? "#0066ff" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: isActive ? "white" : "#555",
                  fontSize: "12px",
                  fontWeight: 600,
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
              >
                {mode === "grid" ? T.viewGrid : T.viewList}
              </button>
            );
          })}
        </div>
      )}

      {/* 스크롤 컨테이너 */}
      <div
        ref={(node) => {
          (
            menuScrollRef as React.MutableRefObject<HTMLDivElement | null>
          ).current = node;
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
        style={{ flex: 1, overflowY: "auto", paddingTop: scrollPaddingTop }}
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
            menuViewMode={menuViewMode}
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
