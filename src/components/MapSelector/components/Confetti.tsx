import { useEffect, useState } from "react";

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "circle" | "rounded-rect";
  opacity: number;
  scale: number;
};

// 트렌디한 토스 스타일 컬러 팔레트 (블루 계열, 화이트, 옐로우 포인트)
const colors = ["#3182F6", "#1B64DA", "#E8F3FF", "#FACC15", "#FFFFFF"];

export default function Confetti({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    // 모던하고 절제된 개수 (너무 많으면 촌스러움)
    const newParticles: Particle[] = Array.from({ length: 45 }).map((_, i) => ({
      id: trigger * 1000 + i,
      x: 50 + (Math.random() - 0.5) * 10, // 화면 하단 중앙에서 살짝 퍼지게
      y: 110, // 화면 완전히 밖에서 시작
      vx: (Math.random() - 0.5) * 40, // 수평 퍼짐
      vy: -(Math.random() * 60 + 60), // 수직 솟아오름 (속도 조절)
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 8, // 조금 더 큼직하고 일관된 크기
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: Math.random() > 0.5 ? "circle" : "rounded-rect",
      opacity: 1,
      scale: Math.random() * 0.5 + 0.8,
    }));

    setParticles(newParticles);

    let animationFrameId: number;
    let lastTime = performance.now();
    let elapsed = 0;

    const update = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1); // 최대 dt 제한 (버벅임 방지)
      lastTime = time;
      elapsed += dt;

      setParticles((prev) =>
        prev
          .map((p) => {
            // 부드러운 공기 저항 (마찰) 적용
            const friction = 0.98;
            const bounceGravity = 120; // 중력

            return {
              ...p,
              x: p.x + p.vx * dt,
              y: p.y + p.vy * dt,
              vx: p.vx * friction, // x축 속도 점진적 감소
              vy: p.vy * friction + bounceGravity * dt, // y축 속도는 중력 영향
              rotation: p.rotation + p.rotationSpeed,
              // 시간에 따른 부드러운 페이드아웃 (2초 이후부터)
              opacity: elapsed > 1.5 ? Math.max(0, 1 - (elapsed - 1.5) * 2) : 1,
            };
          })
          // 화면 아래로 완전히 떨어지거나 투명해지면 제거
          .filter((p) => p.y < 120 && p.opacity > 0),
      );

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    const timeout = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      setParticles([]);
    }, 4000); // 넉넉히 4초 뒤 완전 클리어

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeout);
    };
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg) scale(${p.scale})`,
            borderRadius: p.shape === "circle" ? "50%" : "4px", // 둥근 사각형 혹은 원
            opacity: p.opacity,
            boxShadow:
              p.color === "#FFFFFF"
                ? "0 2px 8px rgba(0,0,0,0.08)" // 하얀색 파티클은 살짝 그림자
                : "none",
            willChange: "transform, opacity", // 성능 최적화
          }}
        />
      ))}
    </div>
  );
}
