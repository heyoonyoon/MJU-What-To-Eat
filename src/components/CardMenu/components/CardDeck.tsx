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

const STACK_VISIBLE = 4;
const MAX_ROTATE = 8;
const RETREAT_MS = 350;
const CANCEL_MS = 300;

const SPRING = `cubic-bezier(0.34, 1.56, 0.64, 1)`;
const EASE_OUT = `cubic-bezier(0.2, 0, 0.4, 1)`;

export type CardDeckHandle = { swipe: () => void };

type Props = {
  cards: CardItem[];
  lang: Lang;
  onAdvance: () => void;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function dragTransform(y: number, hh: number): string {
  const progress = Math.min(1, Math.abs(y) / hh);
  const scale = 1 - progress * 0.08;
  const ro = clamp((Math.abs(y) / hh) * MAX_ROTATE, 0, MAX_ROTATE) * 0.5;
  return `translateY(${y}px) rotate(${ro}deg) scale(${scale})`;
}

function flyTransform(dir: number, hh: number): string {
  const flyY = dir * hh * 2.5;
  return `translateY(${flyY}px) rotate(${MAX_ROTATE}deg) scale(0.85)`;
}

type Phase = "drag" | "cancel" | "retreat" | "done";

const CardDeck = forwardRef<CardDeckHandle, Props>(function CardDeck(
  { cards, lang, onAdvance },
  ref,
) {
  const [dragY, setDragY] = useState(0);
  const [phase, setPhase] = useState<Phase>("drag");
  const [retreatDir, setRetreatDir] = useState(1);

  const startYRef = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hh = useCallback(
    () => (containerRef.current?.offsetHeight ?? 500) / 2,
    [],
  );

  const startRetreat = useCallback(
    (dir: number) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      startYRef.current = null;
      setRetreatDir(dir);
      setPhase("retreat");
      timerRef.current = setTimeout(() => {
        onAdvance();
        setPhase("drag");
        setDragY(0);
        lockedRef.current = false;
      }, RETREAT_MS);
    },
    [onAdvance],
  );

  const cancelSwipe = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    startYRef.current = null;
    setDragY(0);
    setPhase("cancel");
    timerRef.current = setTimeout(() => {
      setPhase("drag");
      lockedRef.current = false;
    }, CANCEL_MS);
  }, []);

  const triggerSwipe = useCallback(() => {
    if (lockedRef.current) return;
    startRetreat(-1);
  }, [startRetreat]);

  useImperativeHandle(ref, () => ({ swipe: triggerSwipe }), [triggerSwipe]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handlePointerDown = useCallback((clientY: number) => {
    if (lockedRef.current) return;
    startYRef.current = clientY;
  }, []);

  const handlePointerMove = useCallback(
    (clientY: number) => {
      if (startYRef.current === null || lockedRef.current) return;
      const dy = clientY - startYRef.current;
      const h = hh();

      setDragY(dy);

      if (Math.abs(dy) >= h) {
        startRetreat(dy > 0 ? 1 : -1);
      }
    },
    [hh, startRetreat],
  );

  const handlePointerUp = useCallback(() => {
    if (lockedRef.current) return;
    if (startYRef.current === null) return;
    const dy = dragY;
    const h = hh();
    if (Math.abs(dy) >= h) {
      startRetreat(dy > 0 ? 1 : -1);
    } else {
      cancelSwipe();
    }
  }, [dragY, hh, startRetreat, cancelSwipe]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") triggerSwipe();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [triggerSwipe]);

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

  const visibleCards = cards.slice(0, STACK_VISIBLE);
  const h = hh();

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        touchAction: "none",
      }}
      onMouseDown={(e) => handlePointerDown(e.clientY)}
      onMouseMove={(e) => handlePointerMove(e.clientY)}
      onMouseUp={() => handlePointerUp()}
      onMouseLeave={() => {
        if (startYRef.current !== null && !lockedRef.current) {
          const dy = dragY;
          const hv = hh();
          if (Math.abs(dy) >= hv) startRetreat(dy > 0 ? 1 : -1);
          else cancelSwipe();
        }
      }}
      onTouchStart={(e) => handlePointerDown(e.touches[0].clientY)}
      onTouchEnd={() => handlePointerUp()}
    >
      {[...visibleCards].reverse().map((item, revIdx) => {
        const i = visibleCards.length - 1 - revIdx;
        const isTop = i === 0;

        if (isTop) {
          let transform: string;
          let transition: string;

          if (phase === "retreat") {
            transform = flyTransform(retreatDir, h);
            transition = `transform ${RETREAT_MS}ms ${EASE_OUT}`;
          } else if (phase === "cancel") {
            transform = "none";
            transition = `transform ${CANCEL_MS}ms ${SPRING}`;
          } else {
            transform = dragY !== 0 ? dragTransform(dragY, h) : "none";
            transition = "none";
          }

          return (
            <MenuCard
              key={`${item.restaurant.id}-${item.menu.menuId}-top`}
              item={item}
              lang={lang}
              transform={transform}
              transition={transition}
              zIndex={STACK_VISIBLE + 1}
              cursor={lockedRef.current ? "default" : "grab"}
            />
          );
        }

        return (
          <MenuCard
            key={`${item.restaurant.id}-${item.menu.menuId}-${i}`}
            item={item}
            lang={lang}
            transform="none"
            transition="none"
            zIndex={STACK_VISIBLE - i}
            cursor="default"
          />
        );
      })}
    </div>
  );
});

export default CardDeck;
