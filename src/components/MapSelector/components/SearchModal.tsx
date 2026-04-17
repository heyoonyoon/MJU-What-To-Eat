import { useLang } from "../../../LangContext";
import { t } from "../../../i18n";

type Props = {
  searchInput: string;
  searchTarget: "name" | "menu";
  searchModalRef: React.RefObject<HTMLDivElement | null>;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchLockRef: React.MutableRefObject<boolean>;
  onClose: () => void;
  onSearchInputChange: (value: string) => void;
  onSearchTargetChange: (target: "name" | "menu") => void;
  onApplySearch: (input: string, target: "name" | "menu") => void;
  onDragStart: (clientX: number, clientY: number) => void;
  onDragMove: (clientX: number, clientY: number) => void;
  onDragEnd: () => void;
  isDragging: () => boolean;
};

export default function SearchModal({
  searchInput,
  searchTarget,
  searchModalRef,
  searchInputRef,
  searchLockRef,
  onClose,
  onSearchInputChange,
  onSearchTargetChange,
  onApplySearch,
  onDragStart,
  onDragMove,
  onDragEnd,
  isDragging,
}: Props) {
  const { lang } = useLang();
  const T = t[lang];

  const handleApply = () => {
    if (searchLockRef.current) return;
    searchLockRef.current = true;
    setTimeout(() => {
      searchLockRef.current = false;
    }, 300);
    onApplySearch(searchInput, searchTarget);
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10000,
          background: "rgba(0,0,0,0.25)",
        }}
      />
      <div
        ref={searchModalRef}
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          right: "1rem",
          zIndex: 10001,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          padding: "12px 16px 16px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          animation: "searchModalSlideDown 0.22s ease forwards",
          touchAction: "none",
        }}
        onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => {
          if (isDragging()) onDragMove(e.clientX, e.clientY);
        }}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={(e) =>
          onDragStart(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchMove={(e) =>
          onDragMove(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchEnd={onDragEnd}
      >
        {/* 드래그 핸들 */}
        <div
          style={{ display: "flex", justifyContent: "center", cursor: "grab" }}
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

        {/* 검색 input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#f5f5f5",
            borderRadius: "14px",
            padding: "0 14px",
            height: "44px",
          }}
        >
          <span style={{ fontSize: "15px", opacity: 0.45, flexShrink: 0 }}>
            🔍
          </span>
          <input
            ref={searchInputRef}
            type="text"
            enterKeyHint="search"
            inputMode="search"
            autoFocus
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
            placeholder={T.searchModalPlaceholder}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "16px",
              fontWeight: 500,
              color: "#111",
              minWidth: 0,
            }}
          />
          {searchInput && (
            <button
              onClick={() => {
                onSearchInputChange("");
                searchInputRef.current?.focus();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0",
                fontSize: "14px",
                color: "#aaa",
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* 검색 타겟 세그먼트 */}
        <div
          style={{
            display: "flex",
            background: "#f0f0f5",
            borderRadius: "10px",
            padding: "3px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "3px",
              bottom: "3px",
              left: "3px",
              width: "calc(50% - 3px)",
              borderRadius: "8px",
              background: "white",
              boxShadow: "0 1px 4px rgba(0,0,0,0.13)",
              transform:
                searchTarget === "name" ? "translateX(100%)" : "translateX(0)",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              pointerEvents: "none",
            }}
          />
          {(["menu", "name"] as const).map((target) => {
            const label = target === "name" ? T.searchByName : T.searchByMenu;
            const isActive = searchTarget === target;
            return (
              <button
                key={target}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSearchTargetChange(target)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  color: isActive ? "#111" : "#888",
                  fontSize: "14px",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  transition: "color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 검색 버튼 */}
        <button
          type="button"
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          onClick={handleApply}
          style={{
            width: "100%",
            padding: "13px 0",
            borderRadius: "12px",
            border: "none",
            background: "#0066ff",
            color: "white",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {T.searchApply}
        </button>
      </div>
    </>
  );
}
