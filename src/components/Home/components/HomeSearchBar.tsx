import { useLang } from "../../../LangContext";
import { t } from "../../../i18n";
import { glassStyle } from "../../GlassPanel";

type Props = {
  searchQuery: string;
  onClick: () => void;
  onClear: () => void;
};

const HomeSearchBar = ({ searchQuery, onClick, onClear }: Props) => {
  const { lang } = useLang();
  const T = t[lang];

  return (
    <div
      onClick={onClick}
      style={{
        ...glassStyle("light"),
        borderRadius: 16,
        height: "52px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "0 16px",
        cursor: "pointer",
        width: "100%",
      }}
    >
      <span style={{ fontSize: "16px", opacity: 0.45, flexShrink: 0 }}>🔍</span>
      <span
        style={{
          flex: 1,
          fontSize: "15px",
          fontWeight: searchQuery ? 600 : 400,
          color: searchQuery ? "#111" : "#aaa",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {searchQuery || T.searchPlaceholder}
      </span>
      {searchQuery && (
        <button
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
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
  );
};

export default HomeSearchBar;
