import {
  useRef, useState, useCallback, useEffect, useImperativeHandle, forwardRef,
} from "react";
import type { CardItem } from "../hooks/useCardDeck";
import type { Lang } from "../../../i18n";
import MenuCard, { lerpTransform } from "./MenuCard";

const STACK_VISIBLE = 4;
const DRAG_FULL = 160;      // 이 픽셀만큼 드래그하면 p=1
const SNAP_THRESHOLD = 0.3;
const ANIM_MS = 280;
const MAX_ROTATE = 18;      // 드래그 시 최대 기울기(deg)
const FLY_X = 420;          // 날아가는 최종 X 거리(px)

export type CardDeckHandle = { swipe: () => void };

type Props = {
  cards: CardItem[];
  lang: Lang;
  onAdvance: () => void;
};

// dragX: 실제 픽셀 (-DRAG_FULL ~ +DRAG_FULL)
// p: 0→1 진행도 (방향 무관)
function topTransform(dragX: number, p: number, flying: boolean, flyDir: number): string {
  if (flying) {
    // snap 완료 애니메이션: 날아가는 방향으로 translateX + 기울기
    const tx = flyDir * FLY_X;
    const ro = flyDir * MAX_ROTATE;
    return `translateX(${tx}px) rotate(${ro}deg) scale(0.85)`;
  }
  const tx = dragX;
  const ro = (dragX / DRAG_FULL) * MAX_ROTATE;
  // 뒤 카드들이 앞으로 오는 효과를 위해 드래그할수록 약간 scale up 억제
  const sc = 1 - p * 0.04;
  return `translateX(${tx}px) rotate(${ro}deg) scale(${sc})`;
}

const CardDeck = forwardRef<CardDeckHandle, Props>(function CardDeck(
  { cards, lang, onAdvance },
  ref,
) {
  const [dragX, setDragX] = useState(0);
  const [flying, setFlying] = useState(false);
  const [flyDir, setFlyDir] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const startXRef = useRef<number | null>(null);
  const dragXRef = useRef(0);
  const isAnimRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const setDragX_ = useCallback((x: number) => {
    dragXRef.current = x;
    setDragX(x);
  }, []);

  const completeSwipe = useCallback((dir: number) => {
    if (isAnimRef.current) return;
    isAnimRef.current = true;
    setIsAnimating(true);
    setFlyDir(dir);
    setFlying(true);
    timerRef.current = setTimeout(() => {
      onAdvance();
      setFlying(false);
      setDragX_(0);
      isAnimRef.current = false;
      setIsAnimating(false);
    }, ANIM_MS);
  }, [onAdvance, setDragX_]);

  const cancelSwipe = useCallback(() => {
    if (isAnimRef.current) return;
    isAnimRef.current = true;
    setIsAnimating(true);
    timerRef.current = setTimeout(() => {
      isAnimRef.current = false;
      setIsAnimating(false);
    }, ANIM_MS);
    setDragX_(0);
  }, [setDragX_]);

  const triggerSwipe = useCallback(() => {
    if (isAnimRef.current) return;
    completeSwipe(1);
  }, [completeSwipe]);

  useImperativeHandle(ref, () => ({ swipe: triggerSwipe }), [triggerSwipe]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const handlePointerDown = useCallback((clientX: number) => {
    if (isAnimRef.current) return;
    startXRef.current = clientX;
  }, []);

  const handlePointerMove = useCallback((clientX: number) => {
    if (startXRef.current === null || isAnimRef.current) return;
    setDragX_(clientX - startXRef.current);
  }, [setDragX_]);

  const handlePointerUp = useCallback((clientX: number) => {
    if (startXRef.current === null || isAnimRef.current) return;
    const delta = clientX - startXRef.current;
    startXRef.current = null;
    const p = Math.abs(delta) / DRAG_FULL;
    if (p >= SNAP_THRESHOLD) completeSwipe(delta > 0 ? 1 : -1);
    else cancelSwipe();
  }, [completeSwipe, cancelSwipe]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") completeSwipe(-1);
      else if (e.key === "ArrowRight") completeSwipe(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [completeSwipe]);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handlePointerMove(e.touches[0].clientX);
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [handlePointerMove]);

  const p = Math.min(1, Math.abs(dragX) / DRAG_FULL);
  // 드래그 중: transition 없음 / 스냅: transition 활성
  const topTr = (isAnimating || flying)
    ? `transform ${ANIM_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
    : "none";
const visibleCards = cards.slice(0, STACK_VISIBLE);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%", touchAction: "none" }}
      onMouseDown={(e) => handlePointerDown(e.clientX)}
      onMouseMove={(e) => handlePointerMove(e.clientX)}
      onMouseUp={(e) => handlePointerUp(e.clientX)}
      onMouseLeave={() => {
        if (startXRef.current !== null && !isAnimRef.current) {
          startXRef.current = null;
          cancelSwipe();
        }
      }}
      onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
      onTouchEnd={(e) => handlePointerUp(e.changedTouches[0].clientX)}
    >
      {[...visibleCards].reverse().map((item, revIdx) => {
        const i = visibleCards.length - 1 - revIdx;
        const isTop = i === 0;

        if (isTop) {
          return (
            <MenuCard
              key={`${item.restaurant.id}-${item.menu.menuId}-top`}
              item={item}
              lang={lang}
              transform={topTransform(dragX, p, flying, flyDir)}
              transition={topTr}
              zIndex={STACK_VISIBLE + 1}
              cursor={isAnimating ? "default" : "grab"}
            />
          );
        }

        return (
          <MenuCard
            key={`${item.restaurant.id}-${item.menu.menuId}-${i}`}
            item={item}
            lang={lang}
            transform={lerpTransform(i, i, 0)}
            transition="none"
            zIndex={STACK_VISIBLE - i}
          />
        );
      })}
    </div>
  );
});

export default CardDeck;
