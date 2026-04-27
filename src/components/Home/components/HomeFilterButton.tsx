import { useLang } from "../../../LangContext";
import { t } from "../../../i18n";
import { glassStyle } from "../../GlassPanel";
import type { Filters } from "../../../store/useSearchStore";

type Props = {
  filters: Filters;
  maxPrice: number | null;
  onClick: () => void;
};

const HomeFilterButton = ({ filters, maxPrice, onClick }: Props) => {
  const { lang } = useLang();
  const T = t[lang];

  const activeCats = filters.cat.filter((c) => c !== "전체");
  const activeCount = activeCats.length + filters.tags.length + (maxPrice !== null ? 1 : 0);
  const hasActive = activeCount > 0;

  return (
    <button
      onClick={onClick}
      style={{
        ...glassStyle("light"),
        borderRadius: 16,
        height: "48px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 18px",
        cursor: "pointer",
        border: hasActive ? "1.5px solid #0066ff" : glassStyle("light").border,
        background: hasActive ? "rgba(0,102,255,0.08)" : glassStyle("light").background,
        color: hasActive ? "#0066ff" : "#444",
        fontSize: "14px",
        fontWeight: 600,
        alignSelf: "flex-start",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {T.filterSheet}
      {hasActive && (
        <span
          style={{
            background: "#0066ff",
            color: "white",
            borderRadius: "999px",
            padding: "1px 7px",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {activeCount}
        </span>
      )}
    </button>
  );
};

export default HomeFilterButton;
