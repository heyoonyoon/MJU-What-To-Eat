import { useEffect, useRef, useState } from "react";

/**
 * scroll 컨테이너 ref를 구독하여 scrollTop / containerHeight / containerWidth를 반환한다.
 * 상위 컴포넌트를 리렌더링하지 않고 이 훅을 사용하는 컴포넌트만 업데이트한다.
 * rAF를 통해 프레임당 1회만 state를 반영한다.
 */
export function useVirtualScroll(
  scrollRef: React.RefObject<HTMLDivElement | null>,
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const [containerWidth, setContainerWidth] = useState(
    () => window.innerWidth,
  );
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // 초기 크기 반영
    setContainerHeight(el.clientHeight);
    setContainerWidth(el.clientWidth);

    const handleScroll = () => {
      if (rafId.current !== null) return; // 이미 rAF 예약됨
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        if (scrollRef.current) {
          setScrollTop(scrollRef.current.scrollTop);
        }
      });
    };

    el.addEventListener("scroll", handleScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      if (scrollRef.current) {
        setContainerHeight(scrollRef.current.clientHeight);
        setContainerWidth(scrollRef.current.clientWidth);
      }
    });
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      ro.disconnect();
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [scrollRef]);

  return { scrollTop, containerHeight, containerWidth };
}
