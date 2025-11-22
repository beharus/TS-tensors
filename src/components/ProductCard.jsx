// components/ProductCard.jsx
import React from 'react';

const ProductCard = ({ product, cart, onQuantityChange }) => {
  const cartItem = cart.find(item => item.card_id === product.card_id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  };

  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/300x200/ffffff/1a1a1a/png?text=Rasm+Yuklanmadi';
  };

  // Prevent double clicks by using proper event handling
  const handleQuantityClick = (e, change) => {
    e.preventDefault();
    e.stopPropagation();
    onQuantityChange(product.card_id, change);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuantityChange(product.card_id, 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
      <div className="h-48 overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-12">
          {product.name}
        </h3>
        
        <div className="text-xl font-bold text-orange-600 mb-4">
          {formatPrice(product.price)}
        </div>

        {currentQuantity > 0 ? (
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2">
            <div className="flex items-center gap-1 flex-1 justify-between">
              <button
                onClick={(e) => handleQuantityClick(e, -5)}
                className="hidden sm:flex w-10 h-10 items-center justify-center bg-linear-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-200 font-bold text-sm shadow-md"
              >
                -5
              </button>
              <button
                onClick={(e) => handleQuantityClick(e, -1)}
                className="w-10 h-10 flex items-center justify-center bg-linear-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-200 font-bold shadow-md"
              >
                -1
              </button>
              <span className="font-bold text-gray-900 text-lg min-w-10 text-center mx-2">
                {currentQuantity}
              </span>
              <button
                onClick={(e) => handleQuantityClick(e, 1)}
                className="w-10 h-10 flex items-center justify-center bg-linear-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-200 font-bold shadow-md"
              >
                +1
              </button>
              <button
                onClick={(e) => handleQuantityClick(e, 5)}
                className="hidden sm:flex w-10 h-10 items-center justify-center bg-linear-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-200 font-bold text-sm shadow-md"
              >
                +5
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full py-3 px-4 bg-linear-to-r from-orange-500 to-yellow-400 text-white font-bold rounded-xl hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-cart-plus"></i>
            Sotib olish
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;