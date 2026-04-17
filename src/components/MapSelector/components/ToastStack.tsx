interface Toast {
  id: number;
  text: string;
  fading: boolean;
}

interface ToastStackProps {
  toasts: Toast[];
  topOffset: number;
}

export default function ToastStack({ toasts, topOffset }: ToastStackProps) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: "fixed", top: topOffset, left: "50%",
      transform: "translateX(-50%)", zIndex: 10002,
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: "6px", pointerEvents: "none",
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)", borderRadius: "12px",
          padding: "10px 16px", color: "white", fontSize: "13px",
          fontWeight: 400, whiteSpace: "nowrap", overflow: "hidden",
          animation: toast.fading
            ? "snackFadeOut 0.4s ease forwards"
            : "snackSlideDown 0.3s ease forwards",
        }}>
          <span style={{ fontSize: "16px" }}>✅</span>
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  );
}
