import { glassStyle } from "../../GlassPanel";
import { t } from "../../../i18n";
import type { Lang } from "../../../i18n";
import type { MarkerModeKey, MarkerModes } from "../../NaverMap";

interface MarkerIslandProps {
  lang: Lang;
  markerModes: MarkerModes;
  markerIslandOpen: boolean;
  menuFilterBarHeight: number;
  onToggleMarkerMode: (mode: MarkerModeKey) => void;
  onToggleIsland: () => void;
}

export default function MarkerIsland({
  lang,
  markerModes,
  markerIslandOpen,
  menuFilterBarHeight,
  onToggleMarkerMode,
  onToggleIsland,
}: MarkerIslandProps) {
  const T = t[lang];

  return (
    <div
      style={{
        position: "absolute",
        top: menuFilterBarHeight + 16,
        right: 0,
        zIndex: 101,
        display: "flex",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          ...glassStyle("light"),
          borderRadius: "14px 0 0 14px",
          padding: "5px 10px 6px",
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          overflow: "hidden",
          maxWidth: markerIslandOpen ? "320px" : "0px",
          paddingLeft: markerIslandOpen ? "10px" : "0px",
          paddingRight: markerIslandOpen ? "10px" : "0px",
          opacity: markerIslandOpen ? 1 : 0,
          transition:
            "max-width 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease, padding 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#aaa",
            letterSpacing: "0.4px",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {T.markerLabel}
        </span>
        <div style={{ display: "flex", flexDirection: "row", gap: "4px" }}>
          {(["price", "menu", "name"] as MarkerModeKey[]).map((mode) => {
            const base =
              mode === "price"
                ? T.markerPrice
                : mode === "menu"
                  ? T.markerMenu
                  : T.markerName;
            const suffix = T.markerSuffix ? ` ${T.markerSuffix}` : "";
            const isActive = markerModes.has(mode);
            return (
              <button
                key={mode}
                onClick={() => onToggleMarkerMode(mode)}
                style={{
                  padding: "3px 9px",
                  borderRadius: "8px",
                  border: isActive
                    ? "1.5px solid rgba(0,102,255,0.25)"
                    : "1.5px solid #e5e7eb",
                  background: isActive
                    ? "rgba(0,102,255,0.08)"
                    : "rgba(0,0,0,0.03)",
                  color: isActive ? "#0066ff" : "#555",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {base + suffix}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onToggleIsland}
        style={{
          ...glassStyle("light"),
          borderLeft: markerIslandOpen
            ? "1px solid rgba(0,0,0,0.06)"
            : undefined,
          borderRadius: markerIslandOpen
            ? "0 14px 14px 0"
            : "14px 0 0 14px",
          width: "22px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          color: "#888",
          padding: 0,
          flexShrink: 0,
          transition: "border-radius 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {markerIslandOpen ? "›" : "‹"}
      </button>
    </div>
  );
}
