interface FilterItem {
  key: string;
  label: string;
}

interface FilterRowProps {
  label: string;
  items: FilterItem[];
  activeItems: string[];
  onToggle: (key: string) => void;
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
        {items.map((item) => {
          const isActive = activeItems.includes(item.key);
          return (
            <button
              key={item.key}
              onClick={() => onToggle(item.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
              style={
                isActive
                  ? {
                      color: "#0066ff",
                      background: "rgba(0,102,255,0.08)",
                      border: "1px solid rgba(0,102,255,0.2)",
                    }
                  : {
                      color: "#374151",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                    }
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
