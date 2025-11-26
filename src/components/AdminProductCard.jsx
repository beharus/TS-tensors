// components/AdminProductCard.jsx
import React, { useState, useRef, useEffect } from 'react';

const AdminProductCard = ({ product, isModified, onUpdate, onSave, isSaving }) => {
   const [localName, setLocalName] = useState(product.name);
   const [localPrice, setLocalPrice] = useState(product.price);
   const [showPercentageInput, setShowPercentageInput] = useState(false);
   const [percentageValue, setPercentageValue] = useState('');
   const priceInputRef = useRef(null);
   const percentageInputRef = useRef(null);

   // Focus percentage input when it appears
   useEffect(() => {
      if (showPercentageInput && percentageInputRef.current) {
         percentageInputRef.current.focus();
         percentageInputRef.current.select();
      }
   }, [showPercentageInput]);

   const handleNameChange = (e) => {
      const value = e.target.value;
      setLocalName(value);
      onUpdate('name', value);
   };

   const handlePriceChange = (e) => {
      const value = e.target.value;
      
      // Allow empty input for easy clearing
      if (value === '') {
         setLocalPrice('');
         onUpdate('price', 0);
         return;
      }
      
      // Remove non-numeric characters except numbers
      const numericValue = value.replace(/[^\d]/g, '');
      
      if (numericValue === '') {
         setLocalPrice('');
         onUpdate('price', 0);
         return;
      }
      
      const price = parseInt(numericValue, 10);
      if (!isNaN(price)) {
         setLocalPrice(price);
         onUpdate('price', price);
      }
   };

   const handlePriceFocus = (e) => {
      // Select all text when focused for easy replacement
      e.target.select();
   };

   const handlePercentageChange = (e) => {
      const value = e.target.value;
      setPercentageValue(value);
   };

   const applyPercentageChange = () => {
      if (!percentageValue) return;
      
      // Parse percentage value (can be negative)
      const percentage = parseFloat(percentageValue);
      if (isNaN(percentage)) return;
      
      const currentPrice = localPrice || product.originalPrice;
      const changeAmount = (currentPrice * percentage) / 100;
      const newPrice = Math.max(0, Math.round(currentPrice + changeAmount));
      
      setLocalPrice(newPrice);
      onUpdate('price', newPrice);
      setShowPercentageInput(false);
      setPercentageValue('');
      
      // Return focus to price input
      setTimeout(() => {
         if (priceInputRef.current) {
            priceInputRef.current.focus();
            priceInputRef.current.select();
         }
      }, 100);
   };

   const handlePercentageKeyPress = (e) => {
      if (e.key === 'Enter') {
         applyPercentageChange();
      } else if (e.key === 'Escape') {
         setShowPercentageInput(false);
         setPercentageValue('');
         if (priceInputRef.current) {
            priceInputRef.current.focus();
         }
      }
   };

   const handlePercentageButtonClick = () => {
      if (showPercentageInput) {
         // If already showing, apply the percentage
         applyPercentageChange();
      } else {
         // Show percentage input
         setShowPercentageInput(true);
         setPercentageValue('');
      }
   };

   const cancelPercentageChange = () => {
      setShowPercentageInput(false);
      setPercentageValue('');
      if (priceInputRef.current) {
         priceInputRef.current.focus();
      }
   };

   const formatPrice = (price) => {
      if (!price && price !== 0) return "0 so'm";
      return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
   };

   // Function to generate a consistent color based on product ID
   const getProductColor = (productId) => {
      const colors = [
         'bg-white',
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
      e.target.src = 'https://via.placeholder.com/300x200/ffffff/1a1a1a/png?text=Rasm+Yuklanmadi';
      // Switch to object-cover for placeholder to fill the container
      e.target.className = "w-full h-full object-cover";
   };

   const isNameModified = localName !== product.originalName;
   const isPriceModified = localPrice !== product.originalPrice;

   return (
      <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative ${
         isModified ? 'border-2 border-orange-500 shadow-orange-100' : 'border-2 border-transparent'
      }`}>
         {/* Modified Badge */}
         {isModified && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10 animate-pulse sm:text-sm sm:px-3 sm:py-1">
               O'zgartirildi
            </div>
         )}

         {/* Product Image Container with Colored Background */}
         <div className={`h-40 overflow-hidden ${getProductColor(product.card_id)} flex items-center justify-center sm:h-48`}>
            <img
               src={product.image}
               alt={product.name}
               className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
               onError={handleImageError}
            />
         </div>

         {/* Product Info */}
         <div className="p-4 sm:p-6">
            {/* Product ID */}
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg inline-block mb-3 font-mono sm:text-sm sm:px-3 sm:py-1">
               ID: {product.card_id}
            </div>

            {/* Name Input */}
            <div className="mb-3 sm:mb-4">
               <label htmlFor={`name-${product.card_id}`} className="block text-xs font-semibold text-gray-700 mb-1 sm:text-sm sm:mb-2">
                  Mahsulot nomi:
               </label>
               <input
                  type="text"
                  id={`name-${product.card_id}`}
                  className={`w-full px-3 py-2 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 sm:px-4 sm:py-3 sm:text-base ${
                     isNameModified
                        ? 'border-orange-500 bg-orange-50 focus:ring-orange-200 focus:border-orange-500'
                        : 'border-gray-200 focus:ring-orange-200 focus:border-orange-500'
                  }`}
                  value={localName}
                  onChange={handleNameChange}
                  placeholder="Mahsulot nomi..."
               />
            </div>

            {/* Price Section */}
            <div className="mb-4 sm:mb-6">
               <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <label htmlFor={`price-${product.card_id}`} className="block text-xs font-semibold text-gray-700 sm:text-sm">
                     Narxi (so'm):
                  </label>
                  
                  {/* Percentage Button */}
                  <button
                     onClick={handlePercentageButtonClick}
                     className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors flex items-center justify-center sm:w-9 sm:h-9 sm:text-sm ${
                        showPercentageInput 
                           ? 'bg-blue-500 text-white hover:bg-blue-600' 
                           : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                     }`}
                     title="Foizda o'zgartirish"
                  >
                     {showPercentageInput ? '✓' : '%'}
                  </button>
               </div>

               {/* Percentage Input */}
               {showPercentageInput && (
                  <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                     <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-blue-700 font-medium flex-1">
                           Foiz kiriting (+10% qo'shadi, -10% ayiradi):
                        </span>
                        <button
                           onClick={cancelPercentageChange}
                           className="w-6 h-6 bg-red-100 text-red-600 rounded text-xs font-bold hover:bg-red-200 transition-colors flex items-center justify-center"
                           title="Bekor qilish"
                        >
                           ×
                        </button>
                     </div>
                     <div className="flex gap-2">
                        <input
                           ref={percentageInputRef}
                           type="text"
                           className="flex-1 px-3 py-2 text-sm border-2 border-blue-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                           value={percentageValue}
                           onChange={handlePercentageChange}
                           onKeyDown={handlePercentageKeyPress}
                           placeholder="Masalan: -10 yoki +15"
                        />
                        <button
                           onClick={applyPercentageChange}
                           disabled={!percentageValue}
                           className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                           Qo'llash
                        </button>
                     </div>
                     <div className="text-xs text-blue-600 mt-2">
                        💡 Masalan: <strong>-10</strong> = 10% arzonlashtirish, <strong>+20</strong> = 20% qimmatlashtirish
                     </div>
                  </div>
               )}

               {/* Price Input */}
               <input
                  ref={priceInputRef}
                  type="text"
                  id={`price-${product.card_id}`}
                  className={`w-full px-3 py-2 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 font-bold text-orange-600 sm:px-4 sm:py-3 sm:text-base ${
                     isPriceModified
                        ? 'border-orange-500 bg-orange-50 focus:ring-orange-200 focus:border-orange-500'
                        : 'border-gray-200 focus:ring-orange-200 focus:border-orange-500'
                  }`}
                  value={localPrice === '' ? '' : formatPrice(localPrice).replace(" so'm", "")}
                  onChange={handlePriceChange}
                  onFocus={handlePriceFocus}
                  placeholder="0"
               />
               
               {/* Original Price */}
               <div className="text-xs text-gray-500 mt-1 sm:mt-2">
                  Asl narx: <span className="font-medium">{formatPrice(product.originalPrice)}</span>
               </div>

               {/* Price Difference */}
               {isPriceModified && localPrice !== '' && (
                  <div className={`text-xs mt-1 font-medium ${
                     localPrice > product.originalPrice ? 'text-green-600' : 'text-red-600'
                  }`}>
                     {localPrice > product.originalPrice ? '↑' : '↓'} 
                     {formatPrice(Math.abs(localPrice - product.originalPrice))} 
                     ({((localPrice - product.originalPrice) / product.originalPrice * 100).toFixed(1)}%)
                  </div>
               )}
            </div>

            {/* Save Button */}
            <button
               onClick={onSave}
               disabled={!isModified || isSaving}
               className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm bg-linear-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg disabled:hover:shadow-none disabled:cursor-not-allowed relative overflow-hidden group sm:px-6 sm:py-4 sm:text-base"
            >
               {/* Shimmer effect */}
               <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
               
               {isSaving ? (
                  <>
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white sm:h-5 sm:w-5"></div>
                     Saqlanmoqda...
                  </>
               ) : (
                  <>
                     <i className="fa-solid fa-floppy-disk text-sm sm:text-base"></i>
                     Saqlash
                  </>
               )}
            </button>
         </div>
      </div>
   );
};

export default AdminProductCard;