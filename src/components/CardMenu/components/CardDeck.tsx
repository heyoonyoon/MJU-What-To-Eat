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
const SWIPE_THRESHOLD = 80;

const SLOT_OFFSET_X = -14;
const SLOT_OFFSET_Y = 4;
const SLOT_SCALE_STEP = 0.03;

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

// 슬롯 번호별 정지 transform — 0=top, 1,2,3=뒤, 4=오프스크린 대기
function slotTransform(slot: number): string {
  const x = slot * SLOT_OFFSET_X;
  const y = slot * SLOT_OFFSET_Y;
  const s = 1 - slot * SLOT_SCALE_STEP;
  return `translateX(${x}px) translateY(${y}px) scale(${s})`;
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
      setDragY(dy);
      if (Math.abs(dy) >= SWIPE_THRESHOLD) {
        startRetreat(dy > 0 ? 1 : -1);
      }
    },
    [startRetreat],
  );

  const handlePointerUp = useCallback(() => {
    if (lockedRef.current) return;
    if (startYRef.current === null) return;
    const dy = dragY;
    if (Math.abs(dy) >= SWIPE_THRESHOLD) {
      startRetreat(dy > 0 ? 1 : -1);
    } else {
      cancelSwipe();
    }
  }, [dragY, startRetreat, cancelSwipe]);

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

  // 가시 카드 + 대기 카드 1장을 렌더 (총 STACK_VISIBLE + 1 장)
  // 대기 카드는 평상시 슬롯 STACK_VISIBLE 위치(오프스크린)에서 숨어 있음
  const renderedCards = cards.slice(0, STACK_VISIBLE + 1);
  const h = hh();
  const isRetreat = phase === "retreat";

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
          if (Math.abs(dy) >= SWIPE_THRESHOLD) startRetreat(dy > 0 ? 1 : -1);
          else cancelSwipe();
        }
      }}
      onTouchStart={(e) => handlePointerDown(e.touches[0].clientY)}
      onTouchEnd={() => handlePointerUp()}
    >
      {[...renderedCards].reverse().map((item, revIdx) => {
        const cardIdx = renderedCards.length - 1 - revIdx;
        const isTop = cardIdx === 0;
        const isReserve = cardIdx === STACK_VISIBLE;

        // retreat 중에는 각 카드가 한 슬롯 앞으로 이동
        const targetSlot = isRetreat ? cardIdx - 1 : cardIdx;

        // key는 카드 id로 고정 — React가 DOM을 slot 이동에 재활용
        const cardKey = `${item.restaurant.id}-${item.menu.menuId}`;

        if (isTop) {
          let transform: string;
          let transition: string;

          if (isRetreat) {
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
              key={cardKey}
              item={item}
              lang={lang}
              transform={transform}
              transition={transition}
              zIndex={STACK_VISIBLE + 10 - cardIdx}
              cursor={lockedRef.current ? "default" : "grab"}
            />
          );
        }

        // 뒤 카드 및 예비 카드 — retreat 시 한 슬롯 앞으로 transition
        const transform = slotTransform(targetSlot);
        const transition = isRetreat
          ? `transform ${RETREAT_MS}ms ${SPRING}`
          : "none";

        // 예비 카드는 retreat 시작 시 opacity 0→1로 페이드 인
        const opacity = isReserve && !isRetreat ? 0 : 1;

        return (
          <MenuCard
            key={cardKey}
            item={item}
            lang={lang}
            transform={transform}
            transition={transition}
            zIndex={STACK_VISIBLE + 10 - cardIdx}
            cursor="default"
            opacity={opacity}
          />
        );
      })}
    </div>
  );
});

export default CardDeck;
