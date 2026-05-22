import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Generates an array of page numbers with ellipsis gaps for large ranges.
 * e.g. [1, '…', 4, 5, 6, '…', 20]
 */
function getPageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [1];

  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push('…');
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push('…');

  pages.push(total);
  return pages;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const range = getPageRange(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center space-x-1 my-6 py-4 border-t border-gray-200 w-full">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-1.5 text-[14px] font-medium text-primary-600 disabled:text-gray-400 disabled:cursor-not-allowed uppercase hover:bg-gray-50 rounded-sm transition-colors"
      >
        Previous
      </button>

      <div className="hidden sm:flex items-center space-x-1">
        {range.map((item, idx) =>
          item === '…' ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-8 h-8 flex items-center justify-center text-[14px] text-[#878787] select-none"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item as number)}
              className={`w-8 h-8 rounded-full text-[14px] font-medium flex items-center justify-center transition-colors ${
                currentPage === item
                  ? 'bg-primary-600 text-white'
                  : 'text-[#212121] hover:bg-gray-100'
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      {/* Mobile: just show current / total */}
      <span className="sm:hidden text-sm text-[#878787] px-3">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-1.5 text-[14px] font-medium text-primary-600 disabled:text-gray-400 disabled:cursor-not-allowed uppercase hover:bg-gray-50 rounded-sm transition-colors"
      >
        Next
      </button>
    </div>
  );
};
