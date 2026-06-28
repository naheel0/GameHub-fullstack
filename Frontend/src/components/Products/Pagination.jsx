import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg border ${
          currentPage === 1
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600'
        }`}
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      {getPageNumbers().map((number, index) => (
        <button
          key={index}
          onClick={() => typeof number === 'number' && onPageChange(number)}
          className={`px-4 py-2 rounded-lg border ${
            number === currentPage
              ? 'bg-red-600 text-white border-red-600'
              : number === '...'
              ? 'bg-gray-800 text-gray-500 cursor-default border-gray-700'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600'
          }`}
          disabled={number === '...'}
        >
          {number}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg border ${
          currentPage === totalPages
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600'
        }`}
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;
