import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const getPaginationRange = (
  currentPage: number,
  totalPages: number
): (number | string)[] => {
  const siblingCount = 1;
  const totalPageNumbersToShow = 5 + 2 * siblingCount;

  if (totalPages <= totalPageNumbersToShow) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [firstPageIndex, "...", ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from({ length: 3 }, (_, i) => currentPage - 1 + i);
    return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const paginationRange = getPaginationRange(currentPage, totalPages);

  const onNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <nav aria-label="Pagination ">
      <ul className="flex justify-center items-center gap-2 mt-10 mb-6">
        <li>
          <button
            onClick={onPrevious}
            disabled={currentPage === 1}
            className=" cursor-pointer flex items-center justify-center px-4 h-10 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>
        </li>

        {paginationRange.map((page, index) => {
          if (typeof page === "string") {
            return (
              <li
                key={`dots-${index}`}
                className=" flex items-center justify-center px-4 h-10 text-gray-400"
              >
                ...
              </li>
            );
          }

          return (
            <li key={page}>
              <button
                onClick={() => onPageChange(page)}
                className={` cursor-pointer flex items-center justify-center px-4 h-10 text-sm font-medium border border-gray-300 rounded-lg 
                  ${
                    page === currentPage
                      ? "z-10 text-white bg-indigo-600 border-indigo-600"
                      : "text-gray-600 bg-white hover:bg-gray-100 hover:text-gray-700"
                  }`}
              >
                {page}
              </button>
            </li>
          );
        })}

        <li>
          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className="flex  cursor-pointer items-center justify-center px-4 h-10 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
