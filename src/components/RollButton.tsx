interface RollButtonProps {
  countAvailable: number;
  onRoll: () => void;
  onViewAll: () => void;
}

export function RollButton({
  countAvailable,
  onRoll,
  onViewAll,
}: RollButtonProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 mt-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-gray-600">
            선택된 조건의 맛집
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {countAvailable}
            <span className="text-lg font-normal text-gray-500 ml-1">개</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onRoll}
            disabled={countAvailable === 0}
            className="flex-1 py-4 bg-[#0066ff] text-white rounded-xl text-base font-semibold shadow-sm hover:bg-[#0052cc] active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:text-gray-400"
          >
            🎲 랜덤 (1개)
          </button>
          <button
            onClick={onViewAll}
            disabled={countAvailable === 0}
            className="flex-1 py-4 bg-white text-[#0066ff] border border-[#0066ff] rounded-xl text-base font-semibold shadow-sm hover:bg-[#f8f9ff] active:scale-[0.98] transition-all disabled:bg-gray-100 disabled:text-gray-300 disabled:border-gray-200"
          >
            🔍 전체 보기
          </button>
        </div>
      </div>
    </div>
  );
}
