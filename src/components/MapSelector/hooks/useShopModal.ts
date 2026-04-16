import { useState, useRef, useCallback } from "react";
import type { Restaurant } from "../../../data2";
import { resistY, resistX } from "../utils";

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
  const shopDragStartX = useRef<number>(0);
  const shopDragCurrentX = useRef<number>(0);

  const closeShopModal = useCallback(() => {
    const el = shopModalRef.current;
    if (!el) {
      setSelectedRestaurant(null);
      return;
    }
    setShopModalClosing(true);
    el.style.animation = "none";
    el.style.transition = "none";
    el.getBoundingClientRect(); // 강제 reflow
    el.style.transition =
      "transform 0.26s cubic-bezier(0.4,0,1,1), opacity 0.22s ease";
    el.style.transform = "translateX(0) translateY(120%)";
    el.style.opacity = "0";
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

  const onShopDragStart = useCallback((clientX: number, clientY: number) => {
    const el = shopModalRef.current;
    if (el) {
      el.style.animation = "none";
      el.style.transition = "none";
      el.style.transform = "translateY(0)";
      el.style.opacity = "1";
    }
    shopDragStartX.current = clientX;
    shopDragStartY.current = clientY;
    shopDragCurrentX.current = 0;
    shopDragCurrentY.current = 0;
    shopDragLastY.current = clientY;
    shopDragLastTime.current = Date.now();
    shopDragVelocity.current = 0;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      if (shopDragStartY.current === null) return;
      const now = Date.now();
      const dt = now - shopDragLastTime.current;
      if (dt > 0) shopDragVelocity.current = (cy - shopDragLastY.current) / dt;
      shopDragLastY.current = cy;
      shopDragLastTime.current = now;
      const deltaY = cy - shopDragStartY.current;
      const deltaX = cx - shopDragStartX.current;
      shopDragCurrentY.current = deltaY;
      shopDragCurrentX.current = deltaX;
      if (shopModalRef.current) {
        const ty = deltaY > 0 ? deltaY : resistY(deltaY);
        const tx = resistX(deltaX);
        shopModalRef.current.style.transform = `translateX(${tx}px) translateY(${ty}px)`;
        shopModalRef.current.style.opacity = String(
          Math.max(0, 1 - Math.max(0, ty) / 200),
        );
      }
    };

    const handleEnd = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);

      if (shopDragStartY.current === null) return;
      shopDragStartY.current = null;

      const velocity = shopDragVelocity.current;
      const delta = shopDragCurrentY.current;
      const shouldDismiss = velocity > 0.5 || delta > 80;

      if (shouldDismiss) {
        setShopModalClosing(true);
        const el = shopModalRef.current;
        if (el) {
          el.style.animation = "none";
          el.style.transition =
            "transform 0.26s cubic-bezier(0.4,0,1,1), opacity 0.22s ease";
          el.style.transform = "translateX(0) translateY(120%)";
          el.style.opacity = "0";
        }
        setTimeout(() => {
          setSelectedRestaurant(null);
          setShopModalClosing(false);
        }, 260);
      } else {
        if (shopModalRef.current) {
          shopModalRef.current.style.transition =
            "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease";
          shopModalRef.current.style.transform = "translateX(0) translateY(0)";
          shopModalRef.current.style.opacity = "1";
        }
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("touchend", handleEnd);
  }, []);

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
  };
}
