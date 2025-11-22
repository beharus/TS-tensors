// components/Toast.jsx
import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
   const [isVisible, setIsVisible] = useState(false);

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

   return (
      <div className={getStyles()}>
         <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1">
               <p className="text-sm font-medium">{message}</p>
            </div>
            <button
               onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
               }}
               className="shrink-0 w-5 h-5 rounded-full hover:bg-black hover:bg-opacity-10 flex items-center justify-center transition-colors"
            >
               <i className="fa-solid fa-times text-xs"></i>
            </button>
         </div>
      </div>
   );
};

export default Toast;