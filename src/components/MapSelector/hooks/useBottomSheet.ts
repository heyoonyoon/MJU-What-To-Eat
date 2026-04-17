import { useState, useRef, useCallback } from "react";

interface UseBottomSheetOptions {
  closeDuration?: number;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

interface UseBottomSheetReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  onSheetReady: (node: HTMLDivElement | null) => void;
  onOverlayReady: (node: HTMLDivElement | null) => void;
  onDragStart: (clientX: number, clientY: number, initialOffsetY?: number, skipThreshold?: boolean) => void;
  onScrollAreaTouchStart: (e: React.TouchEvent) => void;
}

export function useBottomSheet(options: UseBottomSheetOptions = {}): UseBottomSheetReturn {
  const { closeDuration = 230, scrollRef } = options;

  const [isOpen, setIsOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaCleanupRef = useRef<(() => void) | null>(null);

  const onSheetReady = useCallback((node: HTMLDivElement | null) => {
    sheetRef.current = node;
  }, []);

  const onOverlayReady = useCallback((node: HTMLDivElement | null) => {
    overlayRef.current = node;
  }, []);

  const close = useCallback(() => {
    const sheet = sheetRef.current;
    const overlay = overlayRef.current;

    scrollAreaCleanupRef.current?.();
    scrollAreaCleanupRef.current = null;

    if (sheet) {
      sheet.style.pointerEvents = "none";
      sheet.style.animation = "none";
      sheet.style.transition = "none";
      sheet.getBoundingClientRect(); // force reflow
      sheet.style.transition = `transform ${closeDuration}ms cubic-bezier(0.4,0,1,1)`;
      sheet.style.transform = "translateY(120%)";
    }
    if (overlay) {
      overlay.style.pointerEvents = "none";
      overlay.style.animation = `overlayFadeOut 0.23s ease forwards`;
    }

    setTimeout(() => setIsOpen(false), closeDuration);
  }, [closeDuration]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  // drag refs
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);
  const dragLastY = useRef<number>(0);
  const dragLastTime = useRef<number>(0);
  const dragVelocity = useRef<number>(0);
  const dragActive = useRef(false);

  const onDragStart = useCallback((
    _clientX: number,
    clientY: number,
    initialOffsetY = 0,
    skipThreshold = false,
  ) => {
    const el = sheetRef.current;
    if (el) {
      el.style.animation = "none";
      el.style.transition = "none";
      el.style.transform = "translateY(0)";
    }
    dragStartY.current = clientY;
    dragCurrentY.current = 0;
    dragLastY.current = clientY;
    dragLastTime.current = Date.now();
    dragVelocity.current = 0;
    dragActive.current = skipThreshold;

    const DRAG_THRESHOLD = 10;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      if (dragStartY.current === null) return;
      const now = Date.now();
      const dt = now - dragLastTime.current;
      if (dt > 0) dragVelocity.current = (cy - dragLastY.current) / dt;
      dragLastY.current = cy;
      dragLastTime.current = now;
      const deltaY = cy - dragStartY.current;
      dragCurrentY.current = deltaY;

      if (!dragActive.current) {
        if (Math.abs(deltaY) < DRAG_THRESHOLD) return;
        dragActive.current = true;
      }

      if (sheetRef.current) {
        const ty = Math.max(0, deltaY + initialOffsetY);
        sheetRef.current.style.transform = `translateY(${ty}px)`;
      }
    };

    const handleEnd = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);

      if (dragStartY.current === null) return;
      dragStartY.current = null;

      if (!dragActive.current) {
        dragActive.current = false;
        return;
      }
      dragActive.current = false;

      const velocity = dragVelocity.current;
      const delta = dragCurrentY.current + initialOffsetY;
      const shouldDismiss = velocity > 0.5 || delta > 80;

      if (shouldDismiss) {
        close();
      } else if (sheetRef.current) {
        sheetRef.current.style.transition = "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)";
        sheetRef.current.style.transform = "translateY(0)";
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
  }, [close]);

  // 스크롤 최상단에서 아래로 스와이프 시 시트 드래그로 전환
  const onScrollAreaTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollEl = scrollRef?.current;
    if (!scrollEl) return;
    const startY = e.touches[0].clientY;

    const handleMove = (ev: TouchEvent) => {
      const cy = ev.touches[0].clientY;
      const deltaY = cy - startY;

      if (deltaY > 0 && scrollEl.scrollTop <= 0) {
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchend", handleEnd);
        ev.preventDefault();
        onDragStart(ev.touches[0].clientX, startY, 0, true);
      }
    };

    const handleEnd = () => {
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
      scrollAreaCleanupRef.current = null;
    };

    const cleanup = () => {
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
    scrollAreaCleanupRef.current = cleanup;

    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
  }, [scrollRef, onDragStart]);

  return { isOpen, open, close, onSheetReady, onOverlayReady, onDragStart, onScrollAreaTouchStart };
}
