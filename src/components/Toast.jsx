// components/Toast.jsx
import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
   const [isVisible, setIsVisible] = useState(false);
   
   // Check if this is the specific error message
   const isProductLoadingError = message === "Mahsulotlarni yuklashda xatolik. Namoyish uchun misol ma'lumotlar yuklandi.";
   
   // Set the link for this specific error
   const errorLink = isProductLoadingError ? "http://45.94.209.80:8005/LGAtZYN8GA/" : null;

   useEffect(() => {
      setIsVisible(true);

      const timer = setTimeout(() => {
         setIsVisible(false);
         setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
   }, [duration, onClose]);

   const getStyles = () => {
      const baseStyles = "fixed top-4 right-4 z-50 max-w-xs sm:max-w-sm w-full transform transition-all duration-300 ease-in-out rounded-2xl shadow-lg p-4 border-2";
      
      switch (type) {
         case 'success':
            return `${baseStyles} bg-green-50 border-green-200 text-green-800 ${
               isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`;
         case 'error':
            return `${baseStyles} bg-red-50 border-red-200 text-red-800 ${
               isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`;
         case 'warning':
            return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800 ${
               isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`;
         default:
            return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800 ${
               isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`;
      }
   };

   const getIcon = () => {
      const iconBase = "shrink-0 w-6 h-6 rounded-lg flex items-center justify-center";
      
      switch (type) {
         case 'success':
            return (
               <div className={`${iconBase} bg-green-100`}>
                  <i className="fa-solid fa-check text-green-600 text-sm"></i>
               </div>
            );
         case 'error':
            return (
               <div className={`${iconBase} bg-red-100`}>
                  <i className="fa-solid fa-xmark text-red-600 text-sm"></i>
               </div>
            );
         case 'warning':
            return (
               <div className={`${iconBase} bg-yellow-100`}>
                  <i className="fa-solid fa-exclamation text-yellow-600 text-sm"></i>
               </div>
            );
         default:
            return (
               <div className={`${iconBase} bg-blue-100`}>
                  <i className="fa-solid fa-info text-blue-600 text-sm"></i>
               </div>
            );
      }
   };

   const handleLinkClick = (e) => {
      e.stopPropagation();
      if (errorLink) {
         window.open(errorLink, '_blank', 'noopener,noreferrer');
      }
   };

   return (
      <div className={getStyles()}>
         <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1">
               <p className="text-sm font-medium mb-1">{message}</p>
               {type === 'error' && errorLink && (
                  <div className="mt-2">
                     <button
                        onClick={handleLinkClick}
                        className="text-xs font-medium text-red-600 hover:text-red-800 underline transition-colors flex items-center gap-1"
                     >
                        <i className="fa-solid fa-external-link text-xs"></i>
                        Ko'rish uchun bu yerga bosing
                     </button>
                     <p className="text-xs text-gray-500 mt-1 break-all">
                        {errorLink}
                     </p>
                  </div>
               )}
            </div>
            <button
               onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
               }}
               className="shrink-0 w-5 h-5 rounded-full hover:bg-black hover:bg-opacity-10 flex items-center justify-center transition-colors"
               aria-label="Yopish"
            >
               <i className="fa-solid fa-times text-xs"></i>
            </button>
         </div>
      </div>
   );
};

export default Toast;