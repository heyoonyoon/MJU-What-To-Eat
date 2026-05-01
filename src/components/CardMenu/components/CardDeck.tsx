import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import type { CardItem } from "../hooks/useCardDeck";
import type { Lang } from "../../../i18n";
import MenuCard from "./MenuCard";

const SLIDE_MS = 420;
const CANCEL_MS = 300;
const SWIPE_THRESHOLD = 60;
const CARD_GAP = 28;
// iOS-style expo-out: snappy start, silky stop
const EASE_OUT = `cubic-bezier(0.16, 1, 0.3, 1)`;
const SPRING = `cubic-bezier(0.25, 1.1, 0.5, 1)`;

export type CardDeckHandle = { swipe: () => void };

type Props = {
  cards: CardItem[];
  lang: Lang;
  onAdvance: (dir: 1 | -1) => void;
  onCardClick?: (item: CardItem) => void;
  isAtStart?: boolean;
};

const CardDeck = forwardRef<CardDeckHandle, Props>(function CardDeck(
  { cards, lang, onAdvance, onCardClick, isAtStart = false },
  ref,
) {
  const [pixelOffset, setPixelOffset] = useState(0);
  const [trans, setTrans] = useState("none");
  // 0=idle, -1=swiping up (next), 1=swiping down (prev)
  const [animDir, setAnimDir] = useState<0 | -1 | 1>(0);
  const isAnimatingRef = useRef(false);
  const startYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerH = useCallback(
    () => containerRef.current?.offsetHeight ?? 700,
    [],
  );

  const commitSwipe = useCallback(
    (swipeDir: -1 | 1) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      startYRef.current = null;
      const target = swipeDir * (containerH() + CARD_GAP);
      setAnimDir(swipeDir);
      setTrans(`transform ${SLIDE_MS}ms ${EASE_OUT}`);
      setPixelOffset(target);
      timerRef.current = setTimeout(() => {
        onAdvance(swipeDir === -1 ? 1 : -1);
        setTrans("none");
        setPixelOffset(0);
        setAnimDir(0);
        isAnimatingRef.current = false;
      }, SLIDE_MS);
    },
    [containerH, onAdvance],
  );

  const cancelDrag = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    startYRef.current = null;
    setTrans(`transform ${CANCEL_MS}ms ${SPRING}`);
    setPixelOffset(0);
    timerRef.current = setTimeout(() => {
      setTrans("none");
      isAnimatingRef.current = false;
    }, CANCEL_MS);
  }, []);

  useImperativeHandle(ref, () => ({ swipe: () => commitSwipe(-1) }), [commitSwipe]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handlePointerDown = useCallback((clientY: number) => {
    if (isAnimatingRef.current) return;
    startYRef.current = clientY;
  }, []);

  const handlePointerMove = useCallback(
    (clientY: number) => {
      if (startYRef.current === null || isAnimatingRef.current) return;
      const dy = clientY - startYRef.current;
      setPixelOffset(dy);
    },
    [],
  );

  const handlePointerUp = useCallback((item: CardItem) => {
    if (isAnimatingRef.current || startYRef.current === null) return;
    const totalDrag = Math.abs(pixelOffset);
    const isSwipeDown = pixelOffset > 0;
    if (Math.abs(pixelOffset) >= SWIPE_THRESHOLD && !(isAtStart && isSwipeDown)) {
      commitSwipe(pixelOffset < 0 ? -1 : 1);
    } else if (totalDrag < 8) {
      cancelDrag();
      onCardClick?.(item);
    } else {
      cancelDrag();
    }
  }, [pixelOffset, commitSwipe, cancelDrag, onCardClick, isAtStart]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") commitSwipe(-1);
      else if (e.key === "ArrowDown") commitSwipe(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commitSwipe]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handlePointerMove(e.touches[0].clientY);
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [handlePointerMove]);

  if (cards.length === 0) return null;

  const prev = cards[cards.length - 1];
  const curr = cards[0];
  const next = cards.length > 1 ? cards[1] : cards[0];

  // 드래그 중 현재 카드에 미세한 scale 피드백
  const h = containerRef.current?.offsetHeight ?? 700;
  const dragProgress = animDir === 0 ? Math.min(1, Math.abs(pixelOffset) / h) : 0;
  const dragScale = 1 - dragProgress * 0.04;

  const getCardStyle = (slot: number, z: number) => {
    const baseTranslate = `translateY(calc(${slot * 100}% + ${slot * CARD_GAP + pixelOffset}px))`;

    let transform: string;
    let opacity: number;

    if (slot === 0 && animDir === 0) {
      // 대기 중 현재 카드: 드래그 scale 피드백
      transform = `${baseTranslate} scale(${dragScale})`;
    } else {
      transform = baseTranslate;
    }
    opacity = 1;

    return {
      position: "absolute" as const,
      width: "100%",
      height: "100%",
      transform,
      opacity,
      transition: trans,
      zIndex: z,
    };
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        touchAction: "none",
        cursor: isAnimatingRef.current ? "default" : "grab",
      }}
      onMouseDown={(e) => handlePointerDown(e.clientY)}
      onMouseMove={(e) => {
        if (startYRef.current !== null) handlePointerMove(e.clientY);
      }}
      onMouseUp={() => handlePointerUp(curr)}
      onMouseLeave={() => {
        if (startYRef.current !== null && !isAnimatingRef.current) {
          if (Math.abs(pixelOffset) >= SWIPE_THRESHOLD)
            commitSwipe(pixelOffset < 0 ? -1 : 1);
          else cancelDrag();
        }
      }}
      onTouchStart={(e) => handlePointerDown(e.touches[0].clientY)}
      onTouchEnd={(e) => { e.preventDefault(); handlePointerUp(curr); }}
    >
      {[
        ...(isAtStart ? [] : [{ item: prev, slot: -1, z: 1 }]),
        { item: curr, slot: 0, z: 2 },
        { item: next, slot: 1, z: 1 },
      ].map(({ item, slot, z }) => (
        <div
          key={`${item.restaurant.id}-${item.menu.menuId}-${slot}`}
          style={getCardStyle(slot, z)}
        >
          <MenuCard
            item={item}
            lang={lang}
            transform="none"
            transition="none"
            zIndex={z}
            cursor="default"
          />
        </div>
      ))}
    </div>
  );
});

export default CardDeck;
