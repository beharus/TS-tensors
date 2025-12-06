// components/ProductCard.jsx
import React from 'react';

const ProductCard = ({ product, cart, onQuantityChange, showCount = false }) => {
  const cartItem = cart.find(item => item.card_id === product.card_id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;
  
  // Get available count from product (for warehouse mode)
  const availableCount = product.count || 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  };

  // Function to generate a consistent color based on product ID
  const getProductColor = (productId) => {
    const colors = [
      'bg-white'
    ];
    
    // Convert productId to string and handle different data types
    const idString = String(productId || 'default');
    
    // Simple hash function to get consistent color for same product
    const hash = idString.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/300x200/ffffff/1a1a1a/png?text=Rasm+Yuklanmadi';
    // Switch to object-cover for placeholder to fill the container
    e.target.className = "w-full h-full object-cover";
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
    
    // Check if product is available (warehouse mode)
    if (showCount && availableCount <= 0) {
      return; // Don't add if no stock available
    }
    
    onQuantityChange(product.card_id, 1);
  };

  // Check if product can be added (warehouse mode)
  const canAddToCart = () => {
    if (showCount) {
      if (availableCount <= 0) return false;
      if (currentQuantity >= availableCount) return false;
    }
    return true;
  };

  // Check if increment button should be disabled (warehouse mode)
  const isIncrementDisabled = () => {
    if (showCount) {
      return currentQuantity >= availableCount;
    }
    return false;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
      {/* Product Image Container with Colored Background */}
      <div className={`h-48 overflow-hidden ${getProductColor(product.card_id)} flex items-center justify-center relative`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
        
        {/* Available count badge for warehouse mode */}
        {showCount && (
          <div className="absolute top-3 right-3">
            <div className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg ${availableCount > 0 ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
              {availableCount > 0 ? `${availableCount} ta` : 'Yoʻq'}
            </div>
          </div>
        )}
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
                className="flex w-10 h-10 items-center justify-center bg-linear-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-200 font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -5
              </button>
              <button
                onClick={(e) => handleQuantityClick(e, -1)}
                className="w-10 h-10 flex items-center justify-center bg-linear-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-200 font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -1
              </button>
              <div className="flex flex-col items-center mx-2">
                <span className="font-bold text-gray-900 text-lg min-w-10 text-center">
                  {currentQuantity}
                </span>
                {showCount && (
                  <span className="text-xs text-gray-500">
                    {availableCount - currentQuantity} ta qoldi
                  </span>
                )}
              </div>
              <button
                onClick={(e) => handleQuantityClick(e, 1)}
                disabled={isIncrementDisabled()}
                className="w-10 h-10 flex items-center justify-center bg-linear-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-200 font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +1
              </button>
              <button
                onClick={(e) => handleQuantityClick(e, 5)}
                disabled={isIncrementDisabled()}
                className="flex w-10 h-10 items-center justify-center bg-linear-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-200 font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +5
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart()}
            className={`w-full py-3 px-4 bg-linear-to-r ${canAddToCart() ? 'from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500' : 'from-gray-400 to-gray-500 cursor-not-allowed'} text-white font-bold rounded-xl transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
          >
            <i className="fa-solid fa-cart-plus"></i>
            {showCount && availableCount <= 0 ? 'Tugagan' : 'Sotib olish'}
          </button>
        )}

        {/* Barcode display for warehouse mode */}
        {showCount && product.barcode && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Shtrix-kod:</span>
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{product.barcode}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;