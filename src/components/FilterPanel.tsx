import { FilterRow } from "./FilterRow";

interface FilterPanelProps {
  filters: { type: string[]; cat: string[]; solo: string[] };
  onToggleFilter: (key: "cat" | "solo", value: string) => void;
  onReset: () => void;
}

export function FilterPanel({ filters, onToggleFilter }: FilterPanelProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 mt-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        {/* <FilterRow
          label="종류"
          items={["식사", "술집", "카페"]}
          activeItems={filters.type}
          onToggle={(v: string) => onToggleFilter("type", v)}
        /> */}
        <hr className="my-5 border-gray-100" />
        <FilterRow
          label="음식"
          items={[
            "전체",
            "한식",
            "일식",
            "중식",
            "간편식·분식",
            // "고기",
            "양식·아시안",
          ]}
          activeItems={filters.cat}
          onToggle={(v: string) => onToggleFilter("cat", v)}
        />
        <div className="mt-5">
          <FilterRow
            label="혼밥"
            items={["혼밥"]}
            activeItems={filters.solo}
            onToggle={(v: string) => onToggleFilter("solo", v)}
          />
        </div>
      </div>
    </div>
  );
}
