// components/CartPopup.jsx
import React, { useState } from 'react';

const CartPopup = ({ cart, onClose, onConfirmOrder, isSubmitting = false }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhoneChange = (value) => {
    // Format phone number for Uzbekistan
    let formattedPhone = value.replace(/\D/g, '');
    
    if (formattedPhone.startsWith('998')) {
      formattedPhone = formattedPhone.substring(3);
    }
    
    if (formattedPhone.length > 0) {
      if (formattedPhone.length <= 2) {
        formattedPhone = `+998 (${formattedPhone}`;
      } else if (formattedPhone.length <= 5) {
        formattedPhone = `+998 (${formattedPhone.substring(0, 2)}) ${formattedPhone.substring(2)}`;
      } else if (formattedPhone.length <= 7) {
        formattedPhone = `+998 (${formattedPhone.substring(0, 2)}) ${formattedPhone.substring(2, 5)}-${formattedPhone.substring(5)}`;
      } else if (formattedPhone.length <= 9) {
        formattedPhone = `+998 (${formattedPhone.substring(0, 2)}) ${formattedPhone.substring(2, 5)}-${formattedPhone.substring(5, 7)}-${formattedPhone.substring(7)}`;
      } else {
        formattedPhone = `+998 (${formattedPhone.substring(0, 2)}) ${formattedPhone.substring(2, 5)}-${formattedPhone.substring(5, 7)}-${formattedPhone.substring(7, 9)}`;
      }
    }
    
    handleInputChange('phone', formattedPhone);
  };

  const handleSubmit = async () => {
    if (!customerInfo.name.trim()) {
      alert('Iltimos, ismingizni kiriting!');
      return;
    }

    if (!customerInfo.phone.trim() || customerInfo.phone.replace(/\D/g, '').length < 9) {
      alert("Iltimos, to'liq telefon raqamingizni kiriting!");
      return;
    }

    // Clean phone number for API (remove formatting)
    const cleanPhone = customerInfo.phone.replace(/\D/g, '');
    
    // Call the order confirmation function and wait for result
    const success = await onConfirmOrder({
      ...customerInfo,
      phone: cleanPhone
    });

    // If order was successful, close the popup and reset form
    if (success) {
      setCustomerInfo({ name: '', phone: '' });
      // The popup will be closed by the parent component (StoreFront)
    }
  };

  const isFormValid = customerInfo.name.trim() && customerInfo.phone.replace(/\D/g, '').length >= 9;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto transform transition-transform duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Savat</h2>
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="text-3xl text-gray-500 hover:text-orange-500 transition-colors duration-200 disabled:opacity-50"
            >
              &times;
            </button>
          </div>
          
          {/* Customer Information */}
          {cart.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Buyurtma ma'lumotlari</h3>
              
              <div className="space-y-3">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ismingiz *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ismingizni kiriting"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon raqamingiz *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+998 (XX) XXX-XX-XX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    disabled={isSubmitting}
                    maxLength={19}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    O'zbekiston raqami formati: +998 (XX) XXX-XX-XX
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Cart Items */}
          <div className="mb-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <i className="fa-solid fa-cart-shopping text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg">Savat bo'sh</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mahsulotlar</h3>
                {cart.map(item => (
                  <div key={item.card_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-200 shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/60x60/ffffff/1a1a1a/png?text=Rasm';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                        {item.name}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-orange-600 font-bold text-sm">
                          {formatPrice(item.price)}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {item.quantity} ta
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Total and Confirm Button */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Jami:</span>
                <span className="text-xl font-bold text-orange-600">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isFormValid}
                  className="w-full py-3 px-6 bg-linear-to-r from-orange-500 to-yellow-400 text-white font-bold rounded-xl hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Yuborilmoqda...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Buyurtma berish
                    </>
                  )}
                </button>

                {!isFormValid && cart.length > 0 && (
                  <p className="text-xs text-center text-red-500">
                    Iltimos, ism va telefon raqamini to'ldiring
                  </p>
                )}
              </div>

              {/* Order Summary */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                <p className="font-semibold mb-1">Buyurtma xulosasi:</p>
                <p>• {cart.length} ta mahsulot</p>
                <p>• Jami: {formatPrice(getTotalPrice())}</p>
                {customerInfo.name && <p>• Mijoz: {customerInfo.name}</p>}
                {customerInfo.phone && <p>• Telefon: {customerInfo.phone}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPopup;