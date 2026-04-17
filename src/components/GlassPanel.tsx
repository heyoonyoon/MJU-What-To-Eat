import type { CSSProperties, ReactNode } from "react";

export type GlassTone = "light" | "dark" | "blue";

interface GlassPanelProps {
  children?: ReactNode;
  tone?: GlassTone;
  borderRadius?: number | string;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
}

// 글래스모피즘 토큰 — 여기만 수정하면 프로젝트 전체에 반영됩니다.
export const GLASS = {
  light: {
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(255,255,255,0.6)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
  },
  dark: {
    background: "rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(16px) saturate(160%)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
  },
  blue: {
    background: "rgba(0,102,255,0.18)",
    border: "1px solid rgba(0,102,255,0.30)",
    backdropFilter: "blur(20px) saturate(200%)",
    boxShadow: "0 4px 24px rgba(0,102,255,0.14)",
  },
} satisfies Record<GlassTone, CSSProperties & { backdropFilter: string }>;

export function glassStyle(tone: GlassTone = "light"): CSSProperties {
  const g = GLASS[tone];
  return {
    background: g.background,
    border: g.border,
    backdropFilter: g.backdropFilter,
    WebkitBackdropFilter: g.backdropFilter,
    boxShadow: g.boxShadow,
  };
}

export default function GlassPanel({
  children,
  tone = "light",
  borderRadius = 16,
  style,
  className,
  onClick,
}: GlassPanelProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...glassStyle(tone),
        borderRadius,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
