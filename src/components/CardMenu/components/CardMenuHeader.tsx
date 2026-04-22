import type { Lang } from "../../../i18n";
import { LANGS, LANG_LABELS } from "../../../i18n";

type Props = {
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onBack: () => void;
};

const LABELS: Record<Lang, { title: string; subtitle: string }> = {
  ko: { title: "메뉴판", subtitle: "카드를 넘겨 메뉴를 탐색하세요" },
  en: { title: "Menu", subtitle: "Swipe to explore menus" },
  zh: { title: "菜单", subtitle: "滑动浏览菜单" },
  ja: { title: "メニュー", subtitle: "カードをスワイプしてメニューを探索" },
  vi: { title: "Thực đơn", subtitle: "Vuốt để khám phá món ăn" },
};

export default function CardMenuHeader({ lang, onLangChange, onBack }: Props) {
  const label = LABELS[lang];

  return (
    <div
      style={{
        padding: "20px 24px 8px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <div>
        <button
          onClick={onBack}
          style={{
            background: "rgba(0,0,0,0.07)",
            border: "none",
            borderRadius: 12,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 10,
            color: "#333",
          }}
        >
          ← 지도로
        </button>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#111", lineHeight: 1.2 }}>
          {label.title}
        </div>
        <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
          {label.subtitle}
        </div>
      </div>

      {/* Language selector */}
      <div style={{ display: "flex", gap: 6, marginTop: 36 }}>
        {LANGS.map((l) => (
          <button
            key={l}
            onClick={() => onLangChange(l)}
            style={{
              background: l === lang ? "rgba(0,102,255,0.12)" : "rgba(0,0,0,0.05)",
              border: l === lang ? "1.5px solid rgba(0,102,255,0.4)" : "1.5px solid transparent",
              borderRadius: 10,
              width: 34,
              height: 34,
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>
    </div>
  );
}
