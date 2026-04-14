import { FilterRow } from "./FilterRow";
import { useLang } from "../LangContext";
import { t } from "../i18n";

interface FilterPanelProps {
  filters: { type: string[]; cat: string[]; zone: string[]; tags: string[] };
  onToggleFilter: (key: "type" | "cat" | "zone" | "tags", value: string) => void;
  onReset: () => void;
}

export function FilterPanel({ filters, onToggleFilter }: FilterPanelProps) {
  const { lang } = useLang();
  const T = t[lang];

  // Category items: stored as Korean keys, displayed in current language
  const catItems = [
    { key: "전체", label: T.catAll },
    { key: "한식", label: T.catKorean },
    { key: "일식", label: T.catJapanese },
    { key: "중식", label: T.catChinese },
    { key: "간편식·분식", label: T.catSnack },
    { key: "양식·아시안", label: T.catWestern },
  ];

  const tagItems = [
    { key: "👤 혼밥", label: T.tagSolo },
    { key: "💸 저렴이", label: T.tagCheap },
    { key: "💪 고단백", label: T.tagProtein },
    { key: "🥗 건강식", label: T.tagHealthy },
  ];

  return (
    <div>
      <FilterRow
        label={T.labelFood}
        items={catItems}
        activeItems={filters.cat}
        onToggle={(key: string) => onToggleFilter("cat", key)}
      />
      <div className="mt-5">
        <FilterRow
          label={T.labelTag}
          items={tagItems}
          activeItems={filters.tags}
          onToggle={(key: string) => onToggleFilter("tags", key)}
        />
      </div>
    </div>
  );
}
