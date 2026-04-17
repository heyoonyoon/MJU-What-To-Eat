import { useRef } from "react";

export function useSheetDrag(onClose: () => void) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const startY = useRef(0);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const vel = useRef(0);

  const onDragStart = (clientY: number) => {
    dragging.current = true;
    startY.current = clientY;
    lastY.current = clientY;
    lastT.current = Date.now();
    vel.current = 0;
    if (sheetRef.current) sheetRef.current.style.transition = "none";

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const cy = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const now = Date.now();
      const dt = now - lastT.current;
      if (dt > 0) vel.current = (cy - lastY.current) / dt;
      lastY.current = cy;
      lastT.current = now;
      const delta = Math.max(0, cy - startY.current);
      if (sheetRef.current) sheetRef.current.style.transform = `translateY(${delta}px)`;
    };

    const onEnd = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onEnd);
      const delta = Math.max(0, lastY.current - startY.current);
      if (vel.current > 0.5 || delta > 80) {
        onClose();
      } else if (sheetRef.current) {
        sheetRef.current.style.transition = "transform 0.28s cubic-bezier(0.2,0.8,0.2,1)";
        sheetRef.current.style.transform = "translateY(0)";
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);
  };

  return { sheetRef, onDragStart };
}
