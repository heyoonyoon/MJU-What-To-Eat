import { useLang } from "../../LangContext";
import { t } from "../../i18n";
import { glassStyle } from "../GlassPanel";

export type BottomTab = "cards" | "map" | "menu";

type Props = {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
};

const TABS: {
  key: BottomTab;
  icon: string;
  labelKey: "navCard" | "tabMap" | "tabMenu";
}[] = [
  { key: "cards", icon: "🃏", labelKey: "navCard" },
  { key: "map", icon: "🗺️", labelKey: "tabMap" },
  { key: "menu", icon: "📋", labelKey: "tabMenu" },
];

const BottomTabBar = ({ activeTab, onTabChange }: Props) => {
  const { lang } = useLang();
  const T = t[lang];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 600,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        ...glassStyle("light"),
        borderRadius: 0,
        borderTop: "1px solid rgba(255,255,255,0.45)",
        borderLeft: "none",
        borderRight: "none",
        borderBottom: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "56px",
        }}
      >
        {TABS.map(({ key, icon, labelKey }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "6px 0",
                color: isActive ? "#0066ff" : "#999",
                transition: "color 0.18s ease",
              }}
            >
              <span style={{ fontSize: "20px", lineHeight: 1 }}>{icon}</span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: "0.2px",
                }}
              >
                {T[labelKey]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;
