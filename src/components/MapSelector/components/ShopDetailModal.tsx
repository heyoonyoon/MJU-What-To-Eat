import { useLang } from "../../../LangContext";
import { t, CAT_KEY_MAP, TAG_KEY_MAP } from "../../../i18n";
import type { Restaurant } from "../../../data2";

type Props = {
  restaurant: Restaurant;
  shopModalClosing: boolean;
  isScrolledToBottom: boolean;
  shopModalRef: React.RefObject<HTMLDivElement | null>;
  modalScrollRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onModalScroll: () => void;
  onDragStart: (clientX: number, clientY: number) => void;
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
          position: "absolute",
          inset: 0,
          zIndex: 200,
          background: "rgba(0,0,0,0.35)",
          animation: shopModalClosing
            ? "overlayFadeOut 0.23s ease forwards"
            : "overlayFadeIn 0.2s ease forwards",
        }}
      />

      {/* 모달 패널 */}
      <div
        ref={shopModalRef}
        style={{
          position: "absolute",
          bottom: "calc(56px + 12px)",
          left: "12px",
          right: "12px",
          zIndex: 201,
          height: "70vh",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.08)",
          overflow: "hidden",
          willChange: "transform",
          animation:
            "shopModalSlideUp 0.32s cubic-bezier(0.32,0.72,0,1) forwards",
        }}
      >
        {/* 드래그 핸들 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "10px 0 4px",
            cursor: "grab",
            flexShrink: 0,
            touchAction: "none",
          }}
          onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
          onTouchStart={(e) =>
            onDragStart(e.touches[0].clientX, e.touches[0].clientY)
          }
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "999px",
              background: "#d1d5db",
            }}
          />
        </div>

        {/* 상단 고정 헤더 */}
        <div
          style={{
            padding: "8px 20px 12px 20px",
            display: "flex",
            alignItems: "stretch",
            gap: "8px",
            borderBottom: "1px solid #eee",
          }}
        >
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
                marginBottom: "6px",
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#111" }}>
                {restaurant.name}
              </div>
              <button
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
            <span
              style={{
                background: "#e0e0e0",
                color: "#444",
                fontSize: "11px",
                fontWeight: 600,
                borderRadius: "8px",
                padding: "2px 8px",
              }}
            >
              {translateLabel(restaurant.category)}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f5f5f5",
              border: "none",
              borderRadius: "12px",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              color: "#555",
              fontSize: "16px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "flex-start",
            }}
          >
            ✕
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div
          ref={modalScrollRef}
          onScroll={onModalScroll}
          style={{
            overflowY: "auto",
            padding: "16px 20px 48px 20px",
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* 필터 태그 */}
          {(restaurant.filters.isCheap ||
            restaurant.filters.isHighProtein ||
            restaurant.filters.isHealthy ||
            restaurant.solo) && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "5px",
                marginBottom: "12px",
              }}
            >
              {restaurant.solo && (
                <span style={tagStyle}>{T.tagSoloLabel}</span>
              )}
              {restaurant.filters.isCheap && (
                <span style={tagStyle}>{T.tagCheapLabel}</span>
              )}
              {restaurant.filters.isHighProtein && (
                <span style={tagStyle}>{T.tagProteinLabel}</span>
              )}
              {restaurant.filters.isHealthy && (
                <span style={tagStyle}>{T.tagHealthyLabel}</span>
              )}
            </div>
          )}

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
          {restaurant.menus.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
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
                {restaurant.menus.map((menu) => (
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

        {/* 하단 고정 영역 */}
        <div style={{ padding: "12px 24px 24px 24px", position: "relative" }}>
          {/* 스크롤 페이드 + 힌트 */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              left: 0,
              right: 0,
              height: "80px",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))",
              pointerEvents: "none",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: "6px",
            }}
          >
            {!isScrolledToBottom && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  animation: "scrollBounce 1.2s ease-in-out infinite",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#888",
                  }}
                >
                  {T.moreMenu}
                </span>
                <span style={{ fontSize: "14px", opacity: 0.6 }}>↓</span>
              </div>
            )}
          </div>

          {/* 주소 */}
          <div
            style={{
              background: "#f5f5f5",
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "12px",
              color: "#555",
              lineHeight: 1.6,
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: "2px",
                }}
              >
                {T.address}
              </div>
              <div>{restaurant.roadAddress}</div>
            </div>
            <button
              onClick={() =>
                onCopyToast(restaurant.roadAddress, restaurant.roadAddress)
              }
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

          {/* 네이버지도 버튼 */}
          <a
            href={`https://map.naver.com/p/entry/place/${restaurant.naverMapCode}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textAlign: "center",
              padding: "13px 0",
              background: "#03C75A",
              color: "white",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            {T.naverMap}
          </a>
        </div>
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
