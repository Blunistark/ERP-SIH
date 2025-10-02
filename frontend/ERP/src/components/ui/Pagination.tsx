import React from 'react';
import Button from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) return null;

  const getVisiblePageNumbers = (): (number | string)[] => {
    const delta = 2; // Number of pages to show on each side of current page
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    // Always include first page
    range.push(1);

    // Calculate start and end of middle range
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    // Add pages around current page
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Always include last page if there are more than 1 page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Remove duplicates and sort
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // Add ellipsis where needed
    let previousPage = 0;
    uniqueRange.forEach((page) => {
      if (page - previousPage > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      previousPage = page;
    });

    return rangeWithDots;
  };

  const visiblePages = getVisiblePageNumbers();

  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="mr-2"
      >
        Previous
      </Button>

      {visiblePages.map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-gray-400">...</span>
          ) : (
            <Button
              variant={currentPage === page ? "primary" : "secondary"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="min-w-[36px]"
            >
              {page}
            </Button>
          )}
        </div>
      ))}

      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="ml-2"
      >
        Next
      </Button>
    </nav>
  );
};

export default Pagination;