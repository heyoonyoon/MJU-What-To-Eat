import { useLang } from "../../../LangContext";
import { t, LANG_LABELS, LANGS } from "../../../i18n";
import type { Lang } from "../../../i18n";
type Props = {
  searchQuery: string;
  showHint1: boolean;
  langMenuOpen: boolean;
  langMenuVisible: boolean;
  headerRowRef: React.RefObject<HTMLDivElement | null>;
  onSearchBarClick: () => void;
  onClearSearch: () => void;
  onDismissHint: () => void;
  onOpenLangMenu: () => void;
  onCloseLangMenu: () => void;
  onSetLang: (l: Lang) => void;
  onHeaderResize: (height: number) => void;
};

export default function HeaderSection({
  searchQuery,
  showHint1,
  langMenuOpen,
  langMenuVisible,
  headerRowRef,
  onSearchBarClick,
  onClearSearch,
  onDismissHint,
  onOpenLangMenu,
  onCloseLangMenu,
  onSetLang,
  onHeaderResize,
}: Props) {
  const { lang } = useLang();
  const T = t[lang];

  return (
    <div
      ref={(node) => {
        if (!node) return;
        onHeaderResize(node.offsetHeight);
        const ro = new ResizeObserver(() => onHeaderResize(node.offsetHeight));
        ro.observe(node);
        (node as HTMLDivElement & { _ro?: ResizeObserver })._ro?.disconnect();
        (node as HTMLDivElement & { _ro?: ResizeObserver })._ro = ro;
      }}
      style={{
        position: "absolute",
        top: "1rem",
        left: "1rem",
        right: "1rem",
        zIndex: 160,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "6px",
      }}
    >
      {/* 첫 번째 행: 검색바 + 언어아이콘 */}
      <div
        ref={headerRowRef}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "8px",
          width: "100%",
        }}
      >
        {/* 검색바 */}
        <button
          onClick={onSearchBarClick}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            borderRadius: "14px",
            padding: "0 14px",
            height: "40px",
            cursor: "text",
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: "15px", opacity: 0.5, flexShrink: 0 }}>
            🔍
          </span>
          <span
            style={{
              flex: 1,
              fontSize: "14px",
              fontWeight: 500,
              color: searchQuery ? "#111" : "#aaa",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {searchQuery || T.searchPlaceholder}
          </span>
          {searchQuery && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onClearSearch();
              }}
              style={{
                fontSize: "14px",
                color: "#aaa",
                flexShrink: 0,
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ✕
            </span>
          )}
        </button>

        {/* 언어 선택 */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() =>
              langMenuOpen ? onCloseLangMenu() : onOpenLangMenu()
            }
            title="언어 선택 / Language"
            style={{
              fontSize: "20px",
              lineHeight: 1,
              padding: "7px 10px",
              height: "40px",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              borderRadius: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            {LANG_LABELS[lang]}
          </button>
          {langMenuOpen && (
            <>
              <div
                onClick={onCloseLangMenu}
                style={{ position: "fixed", inset: 0, zIndex: 150 }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  zIndex: 151,
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  opacity: langMenuVisible ? 1 : 0,
                  transform: langMenuVisible
                    ? "translateY(0) scale(1)"
                    : "translateY(-8px) scale(0.96)",
                  transformOrigin: "top right",
                  transition:
                    "opacity 0.18s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                {LANGS.map((l) => (
                  <button
                    key={l}
                    onClick={() => onSetLang(l as Lang)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "9px 16px",
                      background: l === lang ? "rgba(0,102,255,0.08)" : "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: l === lang ? 700 : 400,
                      color: l === lang ? "#0066ff" : "#333",
                      whiteSpace: "nowrap",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>{LANG_LABELS[l]}</span>
                    <span>
                      {l === "ko"
                        ? "한국어"
                        : l === "en"
                          ? "English"
                          : l === "zh"
                            ? "中文"
                            : l === "ja"
                              ? "日本語"
                              : "Tiếng Việt"}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>


      {/* 힌트 스낵바 */}
      {showHint1 && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "12px",
            padding: "10px 16px",
            color: "white",
            fontSize: "clamp(13px, 1.8vw, 18px)",
            fontWeight: 400,
            whiteSpace: "normal",
            wordBreak: "keep-all",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: "clamp(16px, 2vw, 22px)", flexShrink: 0 }}>
              ⚠️
            </span>
            <span
              style={{
                whiteSpace: "normal",
                wordBreak:
                  lang === "ja" || lang === "zh" ? "break-all" : "keep-all",
                overflowWrap: "break-word",
              }}
            >
              {T.hintPin}
            </span>
          </div>
          <button
            onClick={onDismissHint}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              fontSize: "16px",
              cursor: "pointer",
              lineHeight: 1,
              padding: "0",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
