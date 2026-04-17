import { useState, useRef, useCallback } from "react";
import type { Restaurant } from "../../../types/restaurant";


export function useShopModal() {
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [shopModalClosing, setShopModalClosing] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const shopModalRef = useRef<HTMLDivElement | null>(null);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollHintEnabledRef = useRef(false);

  // drag refs
  const shopDragStartY = useRef<number | null>(null);
  const shopDragCurrentY = useRef<number>(0);
  const shopDragLastY = useRef<number>(0);
  const shopDragLastTime = useRef<number>(0);
  const shopDragVelocity = useRef<number>(0);
  const shopDragActive = useRef(false);

  const closeShopModal = useCallback(() => {
    const el = shopModalRef.current;
    if (!el) {
      setSelectedRestaurant(null);
      return;
    }
    setShopModalClosing(true);
    el.style.animation = "none";
    el.style.transition = "none";
    el.getBoundingClientRect();
    el.style.transition = "transform 0.26s cubic-bezier(0.4,0,1,1)";
    el.style.transform = "translateY(120%)";
    setTimeout(() => {
      setSelectedRestaurant(null);
      setShopModalClosing(false);
    }, 260);
  }, []);

  const openShopModal = useCallback((r: Restaurant) => {
    setSelectedRestaurant(r);
    scrollHintEnabledRef.current = false;
    setIsScrolledToBottom(false);
    setTimeout(() => {
      const el = modalScrollRef.current;
      if (!el) return;
      const enabled = el.scrollHeight - el.clientHeight >= 120;
      scrollHintEnabledRef.current = enabled;
      setIsScrolledToBottom(!enabled);
    }, 0);
  }, []);

  const handleModalScroll = useCallback(() => {
    if (!scrollHintEnabledRef.current) return;
    const el = modalScrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    setIsScrolledToBottom(atBottom);
  }, []);

  const onShopDragStart = useCallback((_clientX: number, clientY: number, initialOffsetY = 0, skipThreshold = false) => {
    const el = shopModalRef.current;
    if (el) {
      el.style.animation = "none";
      el.style.transition = "none";
      el.style.transform = "translateY(0)";
    }
    shopDragStartY.current = clientY;
    shopDragCurrentY.current = 0;
    shopDragLastY.current = clientY;
    shopDragLastTime.current = Date.now();
    shopDragVelocity.current = 0;
    shopDragActive.current = skipThreshold;

    const DRAG_THRESHOLD = 10;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      if (shopDragStartY.current === null) return;
      const now = Date.now();
      const dt = now - shopDragLastTime.current;
      if (dt > 0) shopDragVelocity.current = (cy - shopDragLastY.current) / dt;
      shopDragLastY.current = cy;
      shopDragLastTime.current = now;
      const deltaY = cy - shopDragStartY.current;
      shopDragCurrentY.current = deltaY;

      if (!shopDragActive.current) {
        if (Math.abs(deltaY) < DRAG_THRESHOLD) return;
        shopDragActive.current = true;
      }

      if (shopModalRef.current) {
        const ty = Math.max(0, deltaY + initialOffsetY);
        shopModalRef.current.style.transform = `translateY(${ty}px)`;
      }
    };

    const handleEnd = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);

      if (shopDragStartY.current === null) return;
      shopDragStartY.current = null;

      if (!shopDragActive.current) {
        shopDragActive.current = false;
        return;
      }
      shopDragActive.current = false;

      const velocity = shopDragVelocity.current;
      const delta = shopDragCurrentY.current + initialOffsetY;
      const shouldDismiss = velocity > 0.5 || delta > 80;

      if (shouldDismiss) {
        setShopModalClosing(true);
        const el = shopModalRef.current;
        if (el) {
          el.style.animation = "none";
          el.style.transition = "transform 0.26s cubic-bezier(0.4,0,1,1)";
          el.style.transform = "translateY(120%)";
        }
        setTimeout(() => {
          setSelectedRestaurant(null);
          setShopModalClosing(false);
        }, 260);
      } else {
        if (shopModalRef.current) {
          shopModalRef.current.style.transition =
            "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)";
          shopModalRef.current.style.transform = "translateY(0)";
        }
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
  }, []);

  // 스크롤 영역 touch — 위로 스와이프 시 scrollTop이 0이면 바텀시트 드래그로 전환
  // passive: false로 touchmove를 가로채 iOS bounce 자체를 preventDefault로 차단
  const onScrollAreaTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollEl = modalScrollRef.current;
    if (!scrollEl) return;
    const startY = e.touches[0].clientY;
    let sheetDragging = false;

    const handleMove = (ev: TouchEvent) => {
      const cy = ev.touches[0].clientY;
      const deltaY = cy - startY;

      if (!sheetDragging) {
        // 위로 스와이프 + 스크롤이 최상단일 때만 전환
        if (deltaY > 0 && scrollEl.scrollTop <= 0) {
          sheetDragging = true;
          ev.preventDefault();
          // startY를 기준점으로 넘겨 이미 이동한 deltaY가 initialOffsetY로 자연스럽게 이어지도록
          onShopDragStart(ev.touches[0].clientX, startY, 0, true);
        }
        return;
      }

      // 이미 sheet dragging 모드 — 기본 스크롤 차단
      ev.preventDefault();
    };

    const handleEnd = () => {
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };

    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
  }, [onShopDragStart]);

  return {
    selectedRestaurant,
    setSelectedRestaurant,
    shopModalClosing,
    isScrolledToBottom,
    shopModalRef,
    modalScrollRef,
    closeShopModal,
    openShopModal,
    handleModalScroll,
    onShopDragStart,
    onScrollAreaTouchStart,
  };
}
