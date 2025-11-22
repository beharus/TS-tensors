// components/Pagination.jsx
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 mt-12 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-3 bg-linear-to-r from-orange-500 to-yellow-400 text-gray-900 font-bold rounded-xl hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      
      <div className="flex gap-2 flex-wrap justify-center">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-4 py-3 font-bold rounded-xl transition-all duration-300 ${
                pageNum === currentPage
                  ? 'bg-linear-to-r from-orange-500 to-yellow-400 text-gray-900 shadow-lg transform -translate-y-0.5'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        {totalPages > 5 && (
          <>
            <span className="px-2 py-3 text-gray-500">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className={`px-4 py-3 font-bold rounded-xl transition-all duration-300 ${
                totalPages === currentPage
                  ? 'bg-linear-to-r from-orange-500 to-yellow-400 text-gray-900 shadow-lg transform -translate-y-0.5'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-3 bg-linear-to-r from-orange-500 to-yellow-400 text-gray-900 font-bold rounded-xl hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;