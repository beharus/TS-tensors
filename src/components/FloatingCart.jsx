// components/FloatingCart.jsx
import React from 'react';

const FloatingCart = ({ cartCount, onCartClick }) => {
  return (
    <div 
      onClick={onCartClick}
      className="fixed bottom-8 right-8 w-16 h-16 bg-linear-to-r from-orange-500 to-yellow-400 rounded-2xl flex items-center justify-center cursor-pointer shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-40 border border-white"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <i className="fa-solid fa-cart-shopping text-xl text-white"></i>
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-white shadow-lg">
            {cartCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default FloatingCart;