import { glassStyle } from "../../GlassPanel";
import { t } from "../../../i18n";
import type { Lang } from "../../../i18n";

interface RollBarProps {
  lang: Lang;
  filteredCount: number;
  isUnrollable: boolean;
  onRoll: () => void;
  onRollMenu: () => void;
  onUnroll: () => void;
}

export default function RollBar({
  lang, filteredCount, isUnrollable, onRoll, onRollMenu, onUnroll,
}: RollBarProps) {
  const T = t[lang];
  const disabled = filteredCount === 0;

  return (
    <div style={{
      position: "absolute", bottom: "16px", left: "12px", right: "72px",
      zIndex: 110, ...glassStyle("light"),
      display: "flex", flexDirection: "row", alignItems: "stretch",
      justifyContent: "center", gap: "6px", padding: "6px 8px",
      height: "52px", boxSizing: "border-box", borderRadius: "16px",
    }}>
      <button
        onClick={isUnrollable ? onUnroll : undefined}
        disabled={!isUnrollable}
        id="unroll-btn"
        onPointerDown={(e) => { if (!isUnrollable) return; e.currentTarget.style.transform = "scale(0.94)"; }}
        onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        style={{
          padding: "0 14px",
          background: isUnrollable ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.02)",
          color: isUnrollable ? "#666" : "#ccc",
          border: "1px solid rgba(0,0,0,0.08)", borderRadius: "10px",
          fontSize: "12px", fontWeight: 600,
          cursor: isUnrollable ? "pointer" : "default",
          whiteSpace: "nowrap", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
        }}
      >
        <span style={{ fontSize: "14px" }}>↺</span>
        {T.unroll}
      </button>

      {([
        { label: T.rollRestaurant, onClick: onRoll },
        { label: T.rollMenu, onClick: onRollMenu },
      ] as { label: string; onClick: () => void }[]).map(({ label, onClick }) => (
        <button
          key={label}
          onClick={(e) => {
            onClick();
            const el = e.currentTarget;
            el.classList.add("roll-pulse-active");
            setTimeout(() => el.classList.remove("roll-pulse-active"), 600);
          }}
          disabled={disabled}
          onPointerDown={(e) => { if (disabled) return; e.currentTarget.style.transform = "scale(0.95)"; }}
          onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          style={{
            flex: 1, padding: "0",
            background: disabled ? "#f5f5f5" : "#0066ff",
            color: disabled ? "#ccc" : "white",
            border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
            cursor: disabled ? "not-allowed" : "pointer",
            whiteSpace: "nowrap", boxShadow: "none",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
