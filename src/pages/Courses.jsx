// src/pages/Courses.jsx
import { useState, useMemo } from "react";
import { FiSearch, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { useCoursesSorted } from "../hooks/useCoursesSorted";
import { usePagination } from "../hooks/usePagination";
import { Link } from "react-router-dom";
import Pager from "../components/Pager";

const SORT_FIELDS = [
  { value: "createdAt", label: "Newest" },
  { value: "price", label: "Price" },
  { value: "title", label: "Alphabetical" },
];

export default function Courses() {
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [dir, setDir] = useState("desc");
  const [pageSize, setPageSize] = useState(12);

  const {
    data: all = [],
    isLoading,
    isError,
    error,
  } = useCoursesSorted({
    sortBy,
    dir,
    qText: q,
    status: "published",
  });

  const list = useMemo(() => all, [all]);

  const {
    paginatedData,
    currentPage,
    totalPages,
    setPage,
    nextPage,
    prevPage,
    rangeStart,
    rangeEnd,
    totalItems,
  } = usePagination(list, pageSize);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Courses</h1>

        <div className="flex min-w-0 items-center gap-2">
          <div className="relative w-full md:max-w-md">
            <FiSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title…"
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3 pl-9 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#49BBBD] focus:ring-2 focus:ring-[#49BBBD]/20 focus:outline-none"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm shadow-sm focus:border-[#49BBBD] focus:ring-2 focus:ring-[#49BBBD]/20 focus:outline-none"
          >
            {SORT_FIELDS.map((s) => (
              <option key={s.value} value={s.value}>
                Sort: {s.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50"
            title={`Direction: ${dir.toUpperCase()}`}
          >
            {dir === "asc" ? <FiArrowUp /> : <FiArrowDown />}
          </button>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm shadow-sm focus:border-[#49BBBD] focus:ring-2 focus:ring-[#49BBBD]/20 focus:outline-none"
          >
            {[6, 12, 24].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </header>

      {isLoading && <GridSkeleton count={pageSize} />}
      {isError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          Failed to load courses. {error.message}
        </div>
      )}
      {!isLoading && !isError && list.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
          No courses match your filters.
        </div>
      )}

      {!isLoading && !isError && list.length > 0 && (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedData.map((c) => (
              <li
                key={c.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {c.thumbnailUrl ? (
                  <img
                    src={c.thumbnailUrl}
                    alt=""
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="grid h-40 w-full place-items-center bg-gray-100 text-xs text-gray-500">
                    No image
                  </div>
                )}
                <div className="p-4">
                  <h3 className="line-clamp-1 text-base font-semibold text-gray-900">
                    {c.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {c.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      {Number(c.price || 0).toLocaleString()}{" "}
                      <span className="text-gray-500">
                        {c.currency || "USD"}
                      </span>
                    </span>

                    {/* ✅ زر View معدل باستخدام Link */}
                    <Link
                      to={`/courses/${c.id}`}
                      className="rounded-lg bg-[#49BBBD] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#2F7E80]"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Pager
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={prevPage}
            onNext={nextPage}
            onGo={setPage}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            totalItems={totalItems}
          />
        </>
      )}
    </div>
  );
}

function GridSkeleton({ count = 12 }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="h-64 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </ul>
  );
}
