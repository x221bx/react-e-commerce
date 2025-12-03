import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Pager({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGo, // optional direct jump
  rangeStart,
  rangeEnd,
  totalItems,
  className = "",
}) {
  if (totalPages <= 1) {
    return (
      <div className={`mt-4 text-sm text-gray-600 ${className}`}>
        Showing {totalItems} item{totalItems === 1 ? "" : "s"}
      </div>
    );
  }

  return (
    <div
      className={`mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-medium text-gray-900">
          {rangeStart}-{rangeEnd}
        </span>{" "}
        of <span className="font-medium text-gray-900">{totalItems}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          <FiChevronLeft /> Prev
        </button>

        {/* Optional quick nav (few pages). Hide if too many */}
        {totalPages <= 7 && (
          <div className="hidden items-center gap-1 sm:flex">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const active = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => onGo?.(p)}
                  className={`h-8 w-8 rounded-md text-sm font-medium ${
                    active
                      ? "bg-[#49BBBD] text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={onNext}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          Next <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
