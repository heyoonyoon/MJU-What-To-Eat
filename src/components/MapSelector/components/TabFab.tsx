import { glassStyle } from "../../GlassPanel";
import { t } from "../../../i18n";
import type { Lang } from "../../../i18n";

interface TabFabProps {
  lang: Lang;
  activeTab: "map" | "menu";
  onTabToggle: () => void;
}

export default function TabFab({ lang, activeTab, onTabToggle }: TabFabProps) {
  const T = t[lang];
  return (
    <button
      onClick={onTabToggle}
      style={{
        position: "absolute", bottom: "16px", right: "12px", zIndex: 110,
        ...glassStyle("light"),
        width: "52px", height: "52px", boxSizing: "border-box",
        borderRadius: "16px", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0,
      }}
      aria-label={activeTab === "map" ? T.tabMenu : T.tabMap}
    >
      <div
        key={activeTab}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          animation: "fabIconPop 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        }}
      >
        {activeTab === "map" ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 10.9997H0V12.9997H24V10.9997Z" fill="#111" />
              <path d="M24 4.00031H0V6.0003H24V4.00031Z" fill="#111" />
              <path d="M24 18H0V20H24V18Z" fill="#111" />
            </svg>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#111", marginTop: "2px" }}>
              {T.tabMenu}
            </span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#fab_clip)">
                <path d="M14.0001 7.00022C14.0001 7.39578 13.8828 7.78246 13.663 8.11136C13.4433 8.44026 13.1309 8.6966 12.7655 8.84798C12.4 8.99935 11.9979 9.03896 11.6099 8.96179C11.222 8.88462 10.8656 8.69414 10.5859 8.41443C10.3062 8.13473 10.1157 7.77836 10.0385 7.3904C9.96136 7.00244 10.001 6.6003 10.1523 6.23485C10.3037 5.8694 10.5601 5.55704 10.889 5.33728C11.2179 5.11752 11.6045 5.00022 12.0001 5.00022C12.5305 5.00022 13.0392 5.21093 13.4143 5.586C13.7894 5.96108 14.0001 6.46978 14.0001 7.00022ZM16.9501 11.9572L12.0001 16.8002L7.0581 11.9642C6.07728 10.9865 5.40854 9.73974 5.13648 8.38181C4.86443 7.02387 5.0013 5.61575 5.52976 4.33562C6.05823 3.0555 6.95455 1.96089 8.1053 1.19033C9.25605 0.419756 10.6095 0.00785145 11.9944 0.00673142C13.3794 0.00561138 14.7335 0.415326 15.8855 1.18403C17.0375 1.95274 17.9356 3.04589 18.4661 4.32516C18.9966 5.60443 19.1358 7.01233 18.8659 8.3707C18.5961 9.72908 17.9293 10.9769 16.9501 11.9562V11.9572ZM16.0001 7.00022C16.0001 6.20909 15.7655 5.43573 15.326 4.77794C14.8865 4.12014 14.2617 3.60745 13.5308 3.3047C12.7999 3.00195 11.9957 2.92274 11.2197 3.07708C10.4438 3.23142 9.73108 3.61238 9.17167 4.17179C8.61226 4.7312 8.2313 5.44393 8.07696 6.21986C7.92262 6.99578 8.00183 7.80005 8.30458 8.53095C8.60733 9.26186 9.12002 9.88657 9.77782 10.3261C10.4356 10.7656 11.209 11.0002 12.0001 11.0002C13.061 11.0002 14.0784 10.5788 14.8285 9.82865C15.5787 9.0785 16.0001 8.06108 16.0001 7.00022ZM21.8671 10.6132L20.4321 10.1332C19.9855 11.3499 19.2799 12.4551 18.3641 13.3722L12.0001 19.6002L5.6601 13.4002C4.4566 12.2012 3.61752 10.6856 3.2401 9.02922C2.82784 8.99127 2.4122 9.03999 2.01989 9.17225C1.62758 9.30451 1.26728 9.51738 0.962144 9.79719C0.657006 10.077 0.413781 10.4175 0.248098 10.7969C0.0824153 11.1763 -0.00205971 11.5862 0.00010148 12.0002V21.7522L7.9831 24.0332L16.0031 22.0332L24.0031 23.9812V13.4832C24.0027 12.8387 23.7947 12.2115 23.41 11.6944C23.0253 11.1773 22.4843 10.7978 21.8671 10.6122V10.6132Z" fill="#111" />
              </g>
              <defs>
                <clipPath id="fab_clip">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#111", marginTop: "2px" }}>
              {T.tabMap}
            </span>
          </>
        )}
      </div>
    </button>
  );
}
