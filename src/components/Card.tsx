import type { Restaurant } from "../data";
import { CAT_COLORS } from "./constants";
import { useLang } from "../LangContext";
import { t, CAT_KEY_MAP } from "../i18n";

interface CardProps {
  data: Restaurant;
  rank: number;
}

export function Card({ data }: CardProps) {
  const { lang } = useLang();
  const T = t[lang];
  const catKey = CAT_KEY_MAP[data.category];
  const catLabel = catKey ? T[catKey] : data.category;

  return (
    <a
      href={`https://map.naver.com/v5/search/${encodeURIComponent(data.name)}`}
      target="_blank"
      rel="noreferrer"
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-[9px] font-medium px-2 py-0.5 rounded-md ${
            CAT_COLORS[data.category] || "bg-gray-100"
          }`}
        >
          {catLabel}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-3 truncate">
        {data.name}
      </h3>
      <div className="text-[10px] text-[#03c75a] font-medium border-t border-gray-100 pt-2 mt-auto">
        {T.naverMap} ↗
      </div>
    </a>
  );
}
