type Props = {
  offset: number;
  total: number;
  onNext: () => void;
  onReset: () => void;
};

export default function CardNavBar({ offset, total, onNext, onReset }: Props) {
  return (
    <div style={{ padding: "16px 24px 32px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 14, color: "#aaa", minWidth: 64 }}>
        {offset + 1} / {total}
      </div>
      <button
        onClick={onNext}
        style={{
          flex: 1,
          height: 52,
          borderRadius: 16,
          border: "none",
          background: "#0066FF",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          color: "#fff",
        }}
      >
        다음 →
      </button>
      <button
        onClick={onReset}
        style={{
          height: 52,
          borderRadius: 16,
          border: "none",
          background: "rgba(0,0,0,0.07)",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          color: "#666",
          padding: "0 16px",
        }}
      >
        처음
      </button>
    </div>
  );
}
