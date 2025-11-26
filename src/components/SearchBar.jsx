// components/SearchBar.jsx
import React, { useEffect, useRef } from 'react';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  const inputRef = useRef(null);

  // Auto-focus when search term changes (like when barcode is scanned)
  useEffect(() => {
    if (searchTerm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Optional: Add any search submission logic here
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Nomi yoki shtrix-kod bo'yicha qidirish..."
        className="flex-1 px-4 py-3 border bg-white border-gray-200 rounded-xl focus:border-orange-500 focus:ring-3 focus:ring-orange-200 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400"
      />
      <button 
        type="submit"
        className="px-5 cursor-pointer text-white py-3.5 bg-linear-to-r from-orange-500 to-yellow-400 font-bold rounded-xl hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <i className="fa-solid fa-search"></i>
      </button>
    </form>
  );
};

export default SearchBar;