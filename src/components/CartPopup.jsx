// components/CartPopup.jsx
import React from 'react';

const CartPopup = ({ cart, onClose, onConfirmOrder, isSubmitting = false }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto transform transition-transform duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Savat</h2>
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="text-3xl text-gray-500 hover:text-orange-500 transition-colors duration-200 disabled:opacity-50"
            >
              &times;
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="mb-8">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <i className="fa-solid fa-cart-shopping text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg">Savat bo'sh</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.card_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg bg-gray-200"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/60x60/ffffff/1a1a1a/png?text=Rasm';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                        {item.name}
                      </div>
                      <div className="text-orange-600 font-bold text-sm">
                        {formatPrice(item.price)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Miqdor: {item.quantity} ta
                      </div>
                    </div>
                    <div className="font-bold text-orange-600 text-lg">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Total and Confirm Button */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-semibold text-gray-900">Jami:</span>
              <span className="text-2xl font-bold text-orange-600">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            
            {cart.length > 0 && (
              <button
                onClick={onConfirmOrder}
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-linear-to-r from-gray-900 to-gray-700 text-white font-bold rounded-xl hover:from-gray-800 hover:to-gray-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i>
                    Buyurtma berish
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPopup;