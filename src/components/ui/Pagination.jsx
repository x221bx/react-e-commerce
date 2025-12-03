// src/components/ui/Pagination.jsx 
import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  onPageChange,
  className = '',
  hideOnSinglePage = true,
  showInfo = true,
}) => {
  const { t } = useTranslation?.() || { t: undefined };
  if (hideOnSinglePage && totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Results info */}
      {showInfo && (
        <div className="text-sm text-[var(--text-muted)] order-2 sm:order-1">
          {totalItems > 0 ? (
            <>
              {t ? t("pagination.showing", "Showing") : "Showing"} <span className="font-medium text-[var(--text-main)]">{rangeStart}</span> {t ? t("pagination.to", "to") : "to"} <span className="font-medium text-[var(--text-main)]">{rangeEnd}</span> {t ? t("pagination.of", "of") : "of"} <span className="font-medium text-[var(--text-main)]">{totalItems}</span> {t ? t("pagination.results", "results") : "results"}
            </>
          ) : (
            t ? t("pagination.noResults", "No results found") : 'No results found'
          )}
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--text-main)] bg-white border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <FiChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t ? t("pagination.prev", "Previous") : "Previous"}</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-sm text-[var(--text-muted)]">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--text-main)] bg-white border border-[var(--border)] hover:bg-[var(--hover-bg)]'
                  }`}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--text-main)] bg-white border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">{t ? t("pagination.next", "Next") : "Next"}</span>
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
