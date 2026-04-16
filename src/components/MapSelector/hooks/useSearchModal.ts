import { useState, useRef } from "react";
import { resistY, resistX } from "../utils";

export function useSearchModal() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchTarget, setSearchTarget] = useState<"name" | "menu">("menu");
  const searchModalRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchLockRef = useRef(false);

  // drag refs
  const dragStartY = useRef<number | null>(null);
  const dragStartX = useRef<number>(0);
  const dragCurrentY = useRef<number>(0);
  const dragCurrentX = useRef<number>(0);
  const dragLastY = useRef<number>(0);
  const dragLastTime = useRef<number>(0);
  const dragVelocity = useRef<number>(0);

  const closeSearchModal = () => {
    const el = searchModalRef.current;
    if (!el) {
      setSearchModalOpen(false);
      return;
    }
    el.style.transition = "transform 0.12s ease, opacity 0.1s ease";
    el.style.transform = "translateY(-16px)";
    el.style.opacity = "0";
    setTimeout(() => setSearchModalOpen(false), 120);
  };

  const onDragStart = (clientX: number, clientY: number) => {
    const el = searchModalRef.current;
    if (el) {
      el.style.animation = "none";
      el.style.transition = "none";
      el.style.transform = "translateY(0)";
      el.style.opacity = "1";
    }
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    dragCurrentX.current = 0;
    dragCurrentY.current = 0;
    dragLastY.current = clientY;
    dragLastTime.current = Date.now();
    dragVelocity.current = 0;
  };

  const onDragMove = (clientX: number, clientY: number) => {
    if (dragStartY.current === null) return;
    const now = Date.now();
    const dt = now - dragLastTime.current;
    if (dt > 0) dragVelocity.current = (clientY - dragLastY.current) / dt;
    dragLastY.current = clientY;
    dragLastTime.current = now;

    const deltaY = clientY - dragStartY.current;
    const deltaX = clientX - dragStartX.current;
    dragCurrentY.current = deltaY;
    dragCurrentX.current = deltaX;

    if (searchModalRef.current) {
      const ty = resistY(deltaY);
      const tx = resistX(deltaX);
      searchModalRef.current.style.transform = `translateX(${tx}px) translateY(${ty}px)`;
      searchModalRef.current.style.opacity = String(
        Math.max(0, 1 - Math.abs(ty) / 180),
      );
    }
  };

  const onDragEnd = () => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;

    const velocity = dragVelocity.current;
    const delta = dragCurrentY.current;
    const shouldDismiss = Math.abs(velocity) > 0.5 || Math.abs(delta) > 80;

    if (shouldDismiss) {
      const direction = delta >= 0 ? 1 : -1;
      const el = searchModalRef.current;
      if (el) {
        el.style.transition = "transform 0.12s ease, opacity 0.1s ease";
        el.style.transform = `translateY(${direction * 120}px)`;
        el.style.opacity = "0";
      }
      setTimeout(() => setSearchModalOpen(false), 120);
    } else {
      if (searchModalRef.current) {
        searchModalRef.current.style.transition =
          "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease";
        searchModalRef.current.style.transform = "translateX(0) translateY(0)";
        searchModalRef.current.style.opacity = "1";
      }
    }
  };

  const isDragging = () => dragStartY.current !== null;

  return {
    searchModalOpen,
    setSearchModalOpen,
    searchInput,
    setSearchInput,
    searchTarget,
    setSearchTarget,
    searchModalRef,
    searchInputRef,
    searchLockRef,
    closeSearchModal,
    onDragStart,
    onDragMove,
    onDragEnd,
    isDragging,
  };
}
