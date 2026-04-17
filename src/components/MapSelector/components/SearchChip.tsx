import { useLang } from "../../../LangContext";
import { t } from "../../../i18n";

const X_ICON = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

type Props = {
  searchQuery: string;
  appliedTarget: "name" | "menu";
  onClear: () => void;
};

export default function SearchChip({
  searchQuery,
  appliedTarget,
  onClear,
}: Props) {
  const { lang } = useLang();
  const T = t[lang];

  if (!searchQuery) return null;

  const label = appliedTarget === "name" ? T.searchByName : T.searchByMenu;

  return (
    <button
      onClick={onClear}
      style={{
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: "4px",
        transition: "all 0.15s ease",
        border: "1.5px solid #0066ff",
        background: "rgba(0,102,255,0.08)",
        color: "#0066ff",
        maxWidth: "200px",
      }}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
      >
        🔍 {label}: {searchQuery}
      </span>
      {X_ICON}
    </button>
  );
}
