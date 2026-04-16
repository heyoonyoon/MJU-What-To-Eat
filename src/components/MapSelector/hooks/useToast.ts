import { useState, useCallback } from "react";

export type Toast = { id: number; text: string; fading: boolean };

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text: message, fading: false }]);
    setTimeout(
      () =>
        setToasts((prev) =>
          prev.map((tt) => (tt.id === id ? { ...tt, fading: true } : tt)),
        ),
      1600,
    );
    setTimeout(
      () => setToasts((prev) => prev.filter((tt) => tt.id !== id)),
      2000,
    );
  }, []);

  return { toasts, showToast };
}
