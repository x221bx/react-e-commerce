// import { useEffect, useMemo, useState } from "react";

// export function usePagination(items, pageSize = 10, initialPage = 1) {
//   const [currentPage, setCurrentPage] = useState(initialPage);

//   const totalItems = items?.length ?? 0;
//   const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

//   useEffect(() => {
//     setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
//   }, [totalPages, pageSize, totalItems]);

//   const startIdx = (currentPage - 1) * pageSize;
//   const endIdx = startIdx + pageSize;

//   const paginatedData = useMemo(() => {
//     if (!Array.isArray(items)) return [];
//     return items.slice(startIdx, endIdx);
//   }, [items, startIdx, endIdx]);

//   const canPrev = currentPage > 1;
//   const canNext = currentPage < totalPages;

//   function nextPage() {
//     if (canNext) setCurrentPage((p) => p + 1);
//   }
//   function prevPage() {
//     if (canPrev) setCurrentPage((p) => p - 1);
//   }
//   function setPage(p) {
//     setCurrentPage(() => Math.min(Math.max(1, p), totalPages));
//   }

//   const rangeStart = totalItems === 0 ? 0 : startIdx + 1;
//   const rangeEnd = Math.min(endIdx, totalItems);

//   return {
//     paginatedData,
//     currentPage,
//     totalPages,
//     pageSize,
//     setPage,
//     nextPage,
//     prevPage,
//     canPrev,
//     canNext,
//     rangeStart,
//     rangeEnd,
//     totalItems,
//   };
// }

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * usePagination(items, pageSize, options)
 *
 * options:
 * - initialPage: number (default 1)
 * - resetKeys: any[]  -> when any key changes, clamp to 1 (e.g., [q, sortBy, dir, status, pageSize])
 * - onPageChange?: (page:number) => void
 */
export function usePagination(items = [], pageSize = 10, options = {}) {
  const { initialPage = 1, resetKeys = [], onPageChange } = options;

  const [currentPage, setCurrentPage] = useState(
    Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1,
  );

  // Keep last reset keys to detect *meaningful* changes
  const lastResetKeys = useRef([]);

  // total info
  const totalItems = items?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));

  // clamp page when pageSize/items change
  useEffect(() => {
    // Shallow compare resetKeys
    const changed =
      resetKeys.length !== lastResetKeys.current.length ||
      resetKeys.some((v, i) => v !== lastResetKeys.current[i]);

    if (changed) {
      lastResetKeys.current = [...resetKeys];
      // reset to 1 only when resetKeys actually changed
      setCurrentPage(1);
      onPageChange?.(1);
      return;
    }

    // If we didn't "reset", we still need to clamp when totalPages shrinks
    setCurrentPage((p) => {
      const next = Math.min(Math.max(p, 1), totalPages);
      if (next !== p) onPageChange?.(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, ...resetKeys]);

  // compute slice
  const { paginatedData, rangeStart, rangeEnd } = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return {
      paginatedData: items.slice(start, end),
      rangeStart: totalItems === 0 ? 0 : start + 1,
      rangeEnd: Math.min(end, totalItems),
    };
  }, [items, pageSize, currentPage, totalItems]);

  const setPage = (p) => {
    const next = Math.min(Math.max(Number(p) || 1, 1), totalPages);
    setCurrentPage(next);
    onPageChange?.(next);
  };

  return {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    setPage,
    nextPage: () => setPage(currentPage + 1),
    prevPage: () => setPage(currentPage - 1),
  };
}

export default usePagination;
