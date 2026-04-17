import { useLang } from "../../../LangContext";
import { t, CAT_KEY_MAP, TAG_KEY_MAP } from "../../../i18n";
import type { Restaurant } from "../../../types/restaurant";

type Props = {
  restaurant: Restaurant;
  shopModalClosing: boolean;
  isScrolledToBottom: boolean;
  shopModalRef: React.RefObject<HTMLDivElement | null>;
  modalScrollRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onModalScroll: () => void;
  onDragStart: (clientX: number, clientY: number, initialOffsetY?: number) => void;
  onScrollAreaTouchStart: (e: React.TouchEvent) => void;
  onCopyToast: (text: string, label: string) => void;
};

export default function ShopDetailModal({
  restaurant,
  shopModalClosing,
  isScrolledToBottom,
  shopModalRef,
  modalScrollRef,
  onClose,
  onModalScroll,
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

  const menuName = (name: {
    ko: string;
    en: string;
    zh: string;
    ja: string;
    vi: string;
  }) => name[lang] || name.ko;

  return (
    <>
      {/* 딤 오버레이 */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "rgba(0,0,0,0.35)",
          animation: shopModalClosing
            ? "overlayFadeOut 0.23s ease forwards"
            : "overlayFadeIn 0.2s ease forwards",
        }}
      />

      {/* 바텀시트 패널 */}
      <div
        ref={shopModalRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10001,
          height: "70vh",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.13)",
          willChange: "transform",
          animation:
            "shopModalSlideUp 0.32s cubic-bezier(0.32,0.72,0,1) forwards",
        }}
      >
        {/* 드래그 영역: 핸들바 + 헤더 전체 */}
        <div
          style={{ flexShrink: 0, cursor: "grab", borderBottom: "1px solid #eee", borderRadius: "20px 20px 0 0", background: "#ffffff", userSelect: "none", WebkitUserSelect: "none" }}
          onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
          onTouchStart={(e) => onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
        >
          {/* 핸들바 */}
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
            <div style={{ width: "36px", height: "4px", borderRadius: "999px", background: "#d1d5db" }} />
          </div>

          {/* 헤더 컨텐츠 */}
          <div style={{ padding: "4px 20px 12px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* 식당 이름 + 닫기 */}
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

          {/* 주소 + 네이버지도 버튼 (좌우 배치) */}
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
            padding: "16px 20px 16px 20px",
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
              <span
                style={{ fontSize: "12px", fontWeight: 600, color: "#888" }}
              >
                {T.minPrice}
              </span>
              <span
                style={{ fontSize: "16px", fontWeight: 800, color: "#111" }}
              >
                {restaurant.minPrice.toLocaleString()}
                {T.priceUnit}
              </span>
            </div>
          )}

          {/* 메뉴 목록 */}
          {(restaurant.menus || []).length > 0 && (
            <div style={{ marginBottom: "0" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#333",
                  marginBottom: "8px",
                }}
              >
                {T.menu}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {(restaurant.menus || []).map((menu) => (
                  <div
                    key={menu.menuId}
                    style={{
                      background: "#f5f5f5",
                      borderRadius: "10px",
                      padding: "9px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: menu.isPrimary
                        ? "1.5px solid #ccc"
                        : "1px solid transparent",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: menu.isPrimary ? 700 : 500,
                          color: "#111",
                        }}
                      >
                        {menuName(menu.name)}
                      </span>
                      {menu.isPrimary && (
                        <span
                          style={{
                            marginLeft: "6px",
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#555",
                            background: "#e0e0e0",
                            borderRadius: "5px",
                            padding: "1px 5px",
                          }}
                        >
                          {T.representative}
                        </span>
                      )}
                      {menu.tags && menu.tags.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            marginTop: "3px",
                            flexWrap: "wrap",
                          }}
                        >
                          {menu.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: "10px",
                                color: "#888",
                                background: "#e8e8e8",
                                borderRadius: "5px",
                                padding: "1px 5px",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {menu.price != null && (
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#111",
                          whiteSpace: "nowrap",
                          marginLeft: "10px",
                        }}
                      >
                        {menu.price.toLocaleString()}
                        {T.priceUnitPlain}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* 스크롤 페이드 힌트 - 바텀시트 하단에 절대 위치 */}
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
      </div>
    </>
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
