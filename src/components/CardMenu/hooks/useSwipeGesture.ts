import { useRef, useCallback } from "react";

type SwipeHandlers = {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

export function useSwipeGesture({ onSwipeLeft, onSwipeRight }: SwipeHandlers) {
  const startXRef = useRef<number | null>(null);
  const THRESHOLD = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (startXRef.current === null) return;
      const delta = e.changedTouches[0].clientX - startXRef.current;
      startXRef.current = null;
      if (delta < -THRESHOLD) onSwipeLeft();
      else if (delta > THRESHOLD) onSwipeRight();
    },
    [onSwipeLeft, onSwipeRight],
  );

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    startXRef.current = e.clientX;
  }, []);

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (startXRef.current === null) return;
      const delta = e.clientX - startXRef.current;
      startXRef.current = null;
      if (delta < -THRESHOLD) onSwipeLeft();
      else if (delta > THRESHOLD) onSwipeRight();
    },
    [onSwipeLeft, onSwipeRight],
  );

  return { onTouchStart, onTouchEnd, onMouseDown, onMouseUp };
}
