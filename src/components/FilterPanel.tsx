import { FilterRow } from "./FilterRow";

interface FilterPanelProps {
  filters: { type: string[]; cat: string[]; zone: string[]; tags: string[] };
  onToggleFilter: (key: "type" | "cat" | "zone" | "tags", value: string) => void;
  onReset: () => void;
}

export function FilterPanel({ filters, onToggleFilter }: FilterPanelProps) {
  return (
    <div>
      <FilterRow
        label="음식"
        items={[
          "전체",
          "한식",
          "일식",
          "중식",
          "간편식·분식",
          "양식·아시안",
        ]}
        activeItems={filters.cat}
        onToggle={(v: string) => onToggleFilter("cat", v)}
      />
      <div className="mt-5">
        <FilterRow
          label="태그"
          items={["👤 혼밥", "💸 저렴이", "💪 고단백", "🥗 건강식"]}
          activeItems={filters.tags}
          onToggle={(v: string) => onToggleFilter("tags", v)}
        />
      </div>
    </div>
  );
}
