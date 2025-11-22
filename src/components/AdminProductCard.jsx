// components/AdminProductCard.jsx
import React, { useState } from 'react';

const AdminProductCard = ({ product, isModified, onUpdate, onSave, isSaving }) => {
   const [localName, setLocalName] = useState(product.name);
   const [localPrice, setLocalPrice] = useState(product.price);

   const handleNameChange = (e) => {
      const value = e.target.value;
      setLocalName(value);
      onUpdate('name', value);
   };

   const handlePriceChange = (e) => {
      const value = parseInt(e.target.value) || 0;
      setLocalPrice(value);
      onUpdate('price', value);
   };

   const formatPrice = (price) => {
      return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
   };

   const handleImageError = (e) => {
      e.target.src = 'https://via.placeholder.com/300x200/ffffff/1a1a1a/png?text=Rasm+Yuklanmadi';
   };

   const isNameModified = localName !== product.originalName;
   const isPriceModified = localPrice !== product.originalPrice;

   return (
      <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative ${
         isModified ? 'border-2 border-orange-500 shadow-orange-100' : 'border-2 border-transparent'
      }`}>
         {/* Modified Badge */}
         {isModified && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10 animate-pulse">
               O'zgartirildi
            </div>
         )}

         {/* Product Image */}
         <div className="h-48 bg-gray-100 overflow-hidden">
            <img
               src={product.image}
               alt={product.name}
               className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
               onError={handleImageError}
            />
         </div>

         {/* Product Info */}
         <div className="p-6">
            {/* Product ID */}
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg inline-block mb-4 font-mono">
               ID: {product.card_id}
            </div>

            {/* Name Input */}
            <div className="mb-4">
               <label htmlFor={`name-${product.card_id}`} className="block text-sm font-semibold text-gray-700 mb-2">
                  Mahsulot nomi:
               </label>
               <input
                  type="text"
                  id={`name-${product.card_id}`}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                     isNameModified
                        ? 'border-orange-500 bg-orange-50 focus:ring-orange-200 focus:border-orange-500'
                        : 'border-gray-200 focus:ring-orange-200 focus:border-orange-500'
                  }`}
                  value={localName}
                  onChange={handleNameChange}
                  placeholder="Mahsulot nomi..."
               />
            </div>

            {/* Price Input */}
            <div className="mb-6">
               <label htmlFor={`price-${product.card_id}`} className="block text-sm font-semibold text-gray-700 mb-2">
                  Narxi (so'm):
               </label>
               <input
                  type="number"
                  id={`price-${product.card_id}`}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 font-bold text-orange-600 ${
                     isPriceModified
                        ? 'border-orange-500 bg-orange-50 focus:ring-orange-200 focus:border-orange-500'
                        : 'border-gray-200 focus:ring-orange-200 focus:border-orange-500'
                  }`}
                  value={localPrice}
                  onChange={handlePriceChange}
                  min="0"
                  placeholder="0"
               />
               <div className="text-sm text-gray-500 mt-2">
                  Asl narx: <span className="font-medium">{formatPrice(product.originalPrice)}</span>
               </div>
            </div>

            {/* Save Button */}
            <button
               onClick={onSave}
               disabled={!isModified || isSaving}
               className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-linear-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg disabled:hover:shadow-none disabled:cursor-not-allowed relative overflow-hidden group"
            >
               {/* Shimmer effect */}
               <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
               
               {isSaving ? (
                  <>
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                     Saqlanmoqda...
                  </>
               ) : (
                  <>
                     <i className="fa-solid fa-floppy-disk"></i>
                     Saqlash
                  </>
               )}
            </button>
         </div>
      </div>
   );
};

export default AdminProductCard;