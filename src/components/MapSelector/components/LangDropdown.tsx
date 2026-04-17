import { LANG_LABELS, LANGS } from "../../../i18n";
import type { Lang } from "../../../i18n";

interface LangDropdownProps {
  lang: Lang;
  langMenuVisible: boolean;
  langMenuPos: { top: number; right: number };
  onClose: () => void;
  onSelect: (l: Lang) => void;
}

export default function LangDropdown({
  lang,
  langMenuVisible,
  langMenuPos,
  onClose,
  onSelect,
}: LangDropdownProps) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 9998 }}
      />
      <div
        style={{
          position: "fixed",
          top: langMenuPos.top,
          right: langMenuPos.right,
          zIndex: 9999,
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
            onClick={() => onSelect(l as Lang)}
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
  );
}
