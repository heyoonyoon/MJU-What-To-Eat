import { useLang } from "../../../LangContext";
import { t, LANG_LABELS } from "../../../i18n";
import { glassStyle } from "../../GlassPanel";

type Props = {
  searchQuery: string;
  showHint1: boolean;
  langMenuOpen: boolean;
  headerRowRef: React.RefObject<HTMLDivElement | null>;
  langBtnRef: React.RefObject<HTMLButtonElement | null>;
  onSearchBarClick: () => void;
  onClearSearch: () => void;
  onDismissHint: () => void;
  onOpenLangMenu: () => void;
  onCloseLangMenu: () => void;
  onHeaderResize: (height: number) => void;
  isScrolled?: boolean;
};

export default function HeaderSection({
  searchQuery,
  showHint1,
  langMenuOpen,
  headerRowRef,
  langBtnRef,
  onSearchBarClick,
  onClearSearch,
  onDismissHint,
  onOpenLangMenu,
  onCloseLangMenu,
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
        top: 8,
        left: 12,
        right: 12,
        zIndex: 160,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "4px",
        paddingTop: "calc(env(safe-area-inset-top) + 0.8rem)",
        paddingRight: "1rem",
        paddingBottom: 0,
        paddingLeft: "1rem",
        background: "transparent",
        pointerEvents: "auto",
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
            ...glassStyle("light"),
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

        {/* 언어 선택 버튼 (드롭다운은 index.tsx에서 fixed 렌더) */}
        <button
          ref={langBtnRef}
          onClick={() => langMenuOpen ? onCloseLangMenu() : onOpenLangMenu()}
          title="언어 선택 / Language"
          style={{
            fontSize: "20px",
            lineHeight: 1,
            padding: "7px 10px",
            height: "40px",
            ...glassStyle("light"),
            borderRadius: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {LANG_LABELS[lang]}
        </button>
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
