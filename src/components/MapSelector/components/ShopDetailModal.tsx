import { useLang } from "../../../LangContext";
import { t, CAT_KEY_MAP, TAG_KEY_MAP } from "../../../i18n";
import type { Restaurant } from "../../../types/restaurant";
import BottomSheet from "../../BottomSheet";

type Props = {
  restaurant: Restaurant;
  isScrolledToBottom: boolean;
  modalScrollRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onModalScroll: () => void;
  onSheetReady: (node: HTMLDivElement | null) => void;
  onOverlayReady: (node: HTMLDivElement | null) => void;
  onDragStart: (clientX: number, clientY: number) => void;
  onScrollAreaTouchStart: (e: React.TouchEvent) => void;
  onCopyToast: (text: string, label: string) => void;
};

export default function ShopDetailModal({
  restaurant,
  isScrolledToBottom,
  modalScrollRef,
  onClose,
  onModalScroll,
  onSheetReady,
  onOverlayReady,
  onDragStart,
  onScrollAreaTouchStart,
  onCopyToast,
}: Props) {
  const { lang } = useLang();
  const T = t[lang];

  const translateLabel = (label: string): string => {
    const catKey = CAT_KEY_MAP[label];
    if (catKey) return T[catKey] ?? label;
    const tagKey = TAG_KEY_MAP[label];
    if (tagKey) return T[tagKey] ?? label;
    return label;
  };

  const menuName = (name: { ko: string; en: string; zh: string; ja: string; vi: string }) =>
    name[lang] || name.ko;

  return (
    <BottomSheet
      onClose={onClose}
      onSheetReady={onSheetReady}
      onOverlayReady={onOverlayReady}
      onDragStart={onDragStart}
      height="70vh"
    >
      {/* 헤더 (드래그 핸들 아래 영역 — 전체가 드래그 가능) */}
      <div
        style={{
          flexShrink: 0,
          borderBottom: "1px solid #eee",
          background: "#ffffff",
          cursor: "grab",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
        onTouchStart={(e) => onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
      >
        <div style={{ padding: "4px 20px 12px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* 식당 이름 + 복사 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  background: "#f5f5f5",
                  borderRadius: "12px",
                  padding: "0 14px",
                  height: "40px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#111" }}>
                  {restaurant.name}
                </div>
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={() => onCopyToast(restaurant.name, restaurant.name)}
                  style={{
                    flexShrink: 0,
                    background: "#e0e0e0",
                    border: "none",
                    borderRadius: "8px",
                    padding: "5px 10px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#444",
                    cursor: "pointer",
                  }}
                >
                  {T.copy}
                </button>
              </div>
            </div>
          </div>

          {/* 카테고리 + 특성 칩 */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            <span style={tagStyle}>{translateLabel(restaurant.category)}</span>
            {restaurant.solo && <span style={tagStyle}>{T.tagSoloLabel}</span>}
            {restaurant.filters?.isCheap && <span style={tagStyle}>{T.tagCheapLabel}</span>}
            {restaurant.filters?.isHighProtein && <span style={tagStyle}>{T.tagProteinLabel}</span>}
            {restaurant.filters?.isHealthy && <span style={tagStyle}>{T.tagHealthyLabel}</span>}
          </div>

          {/* 주소 + 네이버지도 */}
          <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
            <div
              style={{
                flex: 1,
                background: "#f5f5f5",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600, color: "#333", marginBottom: "1px" }}>{T.address}</div>
                <div>{restaurant.roadAddress}</div>
              </div>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={() => onCopyToast(restaurant.roadAddress, restaurant.roadAddress)}
                style={{
                  flexShrink: 0,
                  background: "#e0e0e0",
                  border: "none",
                  borderRadius: "8px",
                  padding: "5px 10px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#444",
                  cursor: "pointer",
                  touchAction: "manipulation",
                }}
              >
                {T.copy}
              </button>
            </div>
            <a
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              href={`https://map.naver.com/p/entry/place/${restaurant.naverMapCode}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 12px",
                background: "#03C75A",
                color: "white",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: 700,
                textDecoration: "none",
                minWidth: "56px",
              }}
            >
              {T.naverMap}
            </a>
          </div>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div
        ref={modalScrollRef}
        onScroll={onModalScroll}
        onTouchStart={onScrollAreaTouchStart}
        style={{
          overflowY: "auto",
          padding: "16px 20px",
          flex: 1,
          minHeight: 0,
          touchAction: "pan-y",
        }}
      >
        {/* 최저가 */}
        {restaurant.minPrice != null && (
          <div
            style={{
              background: "#f5f5f5",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#888" }}>{T.minPrice}</span>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#111" }}>
              {restaurant.minPrice.toLocaleString()}{T.priceUnit}
            </span>
          </div>
        )}

        {/* 메뉴 목록 */}
        {(restaurant.menus || []).length > 0 && (
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#333", marginBottom: "8px" }}>
              {T.menu}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {(restaurant.menus || []).map((menu, index, arr) => (
                <div
                  key={menu.menuId}
                  style={{
                    padding: "16px 0",
                    display: "flex",
                    flexDirection: "column",
                    borderBottom: index < arr.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  {menu.tags && menu.tags.length > 0 && (
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#a0a0a0",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {menu.tags[0]}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {menu.isPrimary && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#fff",
                          background: "#ff542d",
                          borderRadius: "10px",
                          padding: "2px 6px",
                          lineHeight: 1.2,
                        }}
                      >
                        {T.representative}
                      </span>
                    )}
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#111" }}>
                      {menuName(menu.name)}
                    </span>
                  </div>

                  {menu.tags && menu.tags.length > 1 && (
                    <div style={{ fontSize: "13px", color: "#888", marginTop: "4px", lineHeight: 1.4 }}>
                      {menu.tags.slice(1).join(" · ")}
                    </div>
                  )}

                  {menu.price != null && (
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#111", marginTop: "8px" }}>
                      {menu.price.toLocaleString()}{T.priceUnitPlain}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 스크롤 페이드 힌트 */}
      {!isScrolledToBottom && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "48px",
            background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: "6px",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1px",
              animation: "scrollBounce 1.2s ease-in-out infinite",
            }}
          >
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#888" }}>{T.moreMenu}</span>
            <span style={{ fontSize: "13px", opacity: 0.6 }}>↓</span>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

const tagStyle: React.CSSProperties = {
  background: "#f0f0f0",
  color: "#444",
  fontSize: "11px",
  fontWeight: 700,
  borderRadius: "8px",
  padding: "3px 9px",
};
