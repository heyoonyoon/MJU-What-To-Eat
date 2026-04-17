// --- [1] 데이터 및 상수 정의 ---
const COLORS = {
  BLUE: "#5CBFDF",
  YELLOW: "#FFE000",
  GREEN: "#7ABC8B",
  CAMPUS: "#9B9993", // 더 진한 회색으로 변경
  PINK: "#FEA0B3",
  EMPTY: "#F1F3F5", // 선택 해제되었을 때 보여질 빈(회색) 색상
};

// 네가 직접 딴 정확한 SVG 좌표들 적용
const ZONES_DATA = [
  {
    id: "zone-blue",
    name: "A",
    title: "A",
    colorKey: "BLUE" as keyof typeof COLORS,
    path: "M317.534 233.514L138.874 150.164L1.25 89.0728V6.67033L557.25 0.513824L317.534 233.514Z",
    textX: 220,
    textY: 120,
    clickable: true,
  },
  {
    id: "zone-yellow",
    name: "정문",
    title: "정문",
    colorKey: "YELLOW" as keyof typeof COLORS,
    path: "M614 0.513824L466.5 300.514L325 237.973L563 0.513824H614Z",
    textX: 493,
    textY: 140,
    clickable: true,
  },
  {
    id: "zone-green-1",
    name: "B",
    title: "B",
    colorKey: "GREEN" as keyof typeof COLORS,
    path: "M592 371.514L770.5 446.014V560.514H474L592 371.514Z",
    textX: 650,
    textY: 470,
    clickable: true,
  },
  {
    id: "zone-green-2",
    name: "B",
    title: "B",
    colorKey: "GREEN" as keyof typeof COLORS,
    path: "M771 423.014L481 307.014L622 0.513824H771V423.014Z",
    textX: 680,
    textY: 200,
    clickable: true,
  },
  {
    id: "zone-campus",
    name: "명지대",
    title: "명지대",
    colorKey: "CAMPUS" as keyof typeof COLORS,
    path: "M578.75 366.997L309.357 247.014L235.75 294.402L462.08 552.014L578.75 366.997Z",
    textX: 440,
    textY: 380,
    clickable: false,
  },
  {
    id: "zone-pink",
    name: "C",
    title: "C",
    colorKey: "PINK" as keyof typeof COLORS,
    path: "M291.895 241.917L0.5 97.5138V560.514H453.5L219.172 288.369L291.895 241.917Z",
    textX: 150,
    textY: 380,
    clickable: true,
  },
];

// --- [2] 타입 정의 ---
interface MapZoneProps {
  filters: { type: string[]; cat: string[]; zone: string[] };
  onToggleFilter: (key: "type" | "cat" | "zone", value: string) => void;
}

// --- [3] 메인 컴포넌트 ---
export function MapZone({ filters }: MapZoneProps) {
  // const [hoveredZoneName, setHoveredZoneName] = useState<string | null>(null);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mt-6 font-sans">
      {/* 상태 확인용 UI (개발 다 끝나면 지워도 됨) */}
      <div
        className="w-full rounded-2xl shadow-lg border border-white/40 overflow-hidden relative p-6"
        style={{
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* 안내 메시지 */}
        <div className="text-center mb-4 text-gray-800 text-sm font-semibold">
          지도를 클릭하여 구역을 선택하세요
        </div>
        {/* 네가 만든 원본 비율 그대로 적용 */}
        <svg
          className="w-full"
          width="100%"
          height="auto"
          viewBox="0 0 772 562"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 부모 g 태그에 반투명 stroke를 줘서 좀더 부드러운 느낌 */}
          <g
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="6"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {ZONES_DATA.map((zone) => (
              <path
                key={zone.id}
                d={zone.path}
                fill={
                  zone.name === "명지대"
                    ? "rgba(155, 153, 147, 0.85)"
                    : filters.zone.includes(zone.name)
                      ? COLORS[zone.colorKey]
                      : "rgba(241, 243, 245, 0.6)"
                }
                className="transition-all duration-300 cursor-default hover:opacity-90"
              />
            ))}
          </g>

          {/* 구역 텍스트 라벨 */}
          <g className="pointer-events-none">
            {ZONES_DATA.map((zone) => (
              <text
                key={`text-${zone.id}`}
                x={zone.textX}
                y={zone.textY}
                fontSize="30"
                fontWeight="bold"
                fill={
                  zone.name === "명지대"
                    ? "rgba(255,255,255,0.95)"
                    : zone.clickable
                      ? "rgba(0,0,0,0.65)"
                      : "rgba(0,0,0,0.45)"
                }
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {zone.title}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
