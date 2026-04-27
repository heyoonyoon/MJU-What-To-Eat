import { useLang } from "../../../LangContext";
import { t } from "../../../i18n";

type Props = {
  count: number;
  onClick: () => void;
};

const HomeStartButton = ({ count, onClick }: Props) => {
  const { lang } = useLang();
  const T = t[lang];

  const label = T.homeStartBtn.replace("{n}", String(count));

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        height: "56px",
        borderRadius: 16,
        border: "none",
        background: "#0066ff",
        color: "white",
        fontSize: "16px",
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0,102,255,0.35)",
        transition: "opacity 0.15s ease",
      }}
    >
      {label}
    </button>
  );
};

export default HomeStartButton;
