import type { Restaurant } from "../data";
import { Card } from "./Card";

interface ResultGridProps {
  picked: Restaurant[];
  hasRolled: boolean;
  filteredList: Restaurant[];
}

export function ResultGrid({ picked, hasRolled, filteredList }: ResultGridProps) {
  const displayList = hasRolled ? picked : filteredList;
  return (
    <div className="max-w-3xl mx-auto px-4 mt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayList.map((r, i) => <Card key={r.id} data={r} rank={i + 1} />)}
      </div>
    </div>
  );
}
