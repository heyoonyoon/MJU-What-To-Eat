interface FilterRowProps {
  label: string;
  items: string[];
  activeItems: string[];
  onToggle: (value: string) => void;
}

export function FilterRow({
  label,
  items,
  activeItems,
  onToggle,
}: FilterRowProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-12 text-sm font-medium text-gray-600 flex-shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {items.map((item: string) => (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              activeItems.includes(item)
                ? "bg-[#0066ff] border-[#0066ff] text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
