import { useState, useRef, useEffect } from "react";
import type { Restaurant } from "../../../types/restaurant";

export function useMenuScroll(filteredList: Restaurant[], sortedList: Restaurant[]) {
  const [isMenuScrolled, setIsMenuScrolled] = useState(false);
  const menuScrollRef = useRef<HTMLDivElement | null>(null);
  const savedMenuScrollTop = useRef(0);
  const savedScrollListenerCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    savedMenuScrollTop.current = 0;
    menuScrollRef.current?.scrollTo({ top: 0 });
  }, [filteredList, sortedList]);

  const onScrollRefReady = (node: HTMLDivElement | null) => {
    savedScrollListenerCleanup.current?.();
    savedScrollListenerCleanup.current = null;
    menuScrollRef.current = node;
    if (!node) return;
    if (savedMenuScrollTop.current > 0) node.scrollTop = savedMenuScrollTop.current;
    const handler = () => {
      const scrolled = node.scrollTop > 5;
      savedMenuScrollTop.current = node.scrollTop;
      setIsMenuScrolled(scrolled);
      const backdrop = document.querySelector(".header-backdrop");
      if (backdrop) {
        if (scrolled) backdrop.classList.add("is-scrolled");
        else backdrop.classList.remove("is-scrolled");
      }
    };
    node.addEventListener("scroll", handler, { passive: true });
    savedScrollListenerCleanup.current = () => node.removeEventListener("scroll", handler);
  };

  return { isMenuScrolled, onScrollRefReady };
}
