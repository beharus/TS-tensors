// components/StoreFront.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ProductCard from './ProductCard';
import CartPopup from './CartPopup';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import ToastContainer from './ToastContainer';
import BarcodeScanner from './BarcodeScanner';
import useToast from '../hooks/useToast';

const API_BASE_URL = "https://tujjors.uz/api";

const StoreFront = ({ isWarehouse = false }) => {
   const { id: storeId } = useParams();
   const location = useLocation();
   const { toasts, toast, removeToast } = useToast();
   const [client, setClient] = useState({});
   const [products, setProducts] = useState([]);
   const [filteredProducts, setFilteredProducts] = useState([]);
   const [cart, setCart] = useState([]);
   const [loading, setLoading] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const [currentPage, setCurrentPage] = useState(1);
   const [isCartOpen, setIsCartOpen] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [selectedCategory, setSelectedCategory] = useState('all');
   const [categories, setCategories] = useState([]);
   const [showScanner, setShowScanner] = useState(false);
   const [showCategoryMenu, setShowCategoryMenu] = useState(false);
   const itemsPerPage = 20;

   // Determine if we're in warehouse mode from route
   const isWarehouseMode = isWarehouse || location.pathname.includes('/warehouse');

   useEffect(() => {
      if (storeId) {
         fetchProducts();
      }
   }, [storeId, isWarehouseMode]);

   useEffect(() => {
      filterProducts();
   }, [searchTerm, selectedCategory, products]);

   const fetchProducts = async () => {
      if (!storeId) return;

      setLoading(true);

      try {
         const endpoint = isWarehouseMode ? 'warehouse' : '';
         const url = `${API_BASE_URL}/${storeId}/${endpoint}`;
         console.log("Fetching from:", url);
         const response = await fetch(url);

         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }

         const data = await response.json();
         console.log("API Response:", data);

         // Set client name from API (for warehouse mode)
         if (data.client && data.client.name) {
            setClient(data.client);
         }

         // Validate API structure
         if (!data || !Array.isArray(data.cards)) {
            console.warn("Invalid API structure:", data);
            throw new Error("Invalid API response structure");
         }

         // Transform products - fix image URLs
         const transformed = data.cards.map(item => ({
            card_id: item.card_id || 0,
            name: item.name || "Nomaʼlum mahsulot",
            price: item.price || 0,
            image: fixImageUrl(item.image) || "https://via.placeholder.com/300x200",
            category: item.category || "Boshqa",
            barcode: item.barcode || null,
            count: item.count || 0 // Available count (warehouse mode)
         }));

         setProducts(transformed);

         // Extract unique categories
         const uniqueCategories = ['all', ...new Set(transformed.map(p => p.category).filter(Boolean))];
         setCategories(uniqueCategories);

         toast.success("Mahsulotlar muvaffaqiyatli yuklandi!", 3000);
      } catch (error) {
         console.error("Error fetching products:", error);
         toast.error("Mahsulotlarni yuklashda xatolik. Namoyish uchun misol ma'lumotlar yuklandi.", 5000);
         setProducts(getSampleProducts());
         if (isWarehouseMode) {
            setClient({ name: "Demo Do'kon" });
         }
      } finally {
         setLoading(false);
      }
   };

   const filterProducts = () => {
      let filtered = products;

      // Filter by search term (name or barcode)
      if (searchTerm) {
         filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.barcode && product.barcode.toString().includes(searchTerm))
         );
      }

      // Filter by category
      if (selectedCategory !== 'all') {
         filtered = filtered.filter(product =>
            product.category === selectedCategory
         );
      }

      setFilteredProducts(filtered);
      setCurrentPage(1);
   };

   const fixImageUrl = (url) => {
      if (!url) return "";
      // Fix double slashes in URL
      return url.replace(/(https?:\/\/[^\/]+)\/\//, "$1/");
   };

   const updateCartQuantity = (productId, change) => {
      const product = products.find(p => p.card_id === productId);
      if (!product) return;

      setCart(prevCart => {
         const existingItemIndex = prevCart.findIndex(item => item.card_id === productId);

         if (existingItemIndex !== -1) {
            const updatedCart = [...prevCart];
            const newQuantity = updatedCart[existingItemIndex].quantity + change;

            if (newQuantity <= 0) {
               // Remove item if quantity becomes 0 or less
               toast.info(`"${product.name}" savatdan olib tashlandi!`, 3000);
               return updatedCart.filter(item => item.card_id !== productId);
            }

            // Check if quantity exceeds available count (warehouse mode)
            if (isWarehouseMode) {
               const maxAvailable = product.count || 0;
               if (newQuantity > maxAvailable) {
                  toast.warning(`Faqat ${maxAvailable} ta mavjud!`, 3000);
                  return updatedCart;
               }
            }

            // Update quantity
            updatedCart[existingItemIndex] = {
               ...updatedCart[existingItemIndex],
               quantity: newQuantity
            };

            if (change > 0) {
               toast.success(`"${product.name}" dan ${change} ta qo'shildi!`, 2000);
            }

            return updatedCart;
         } else if (change > 0) {
            // Check if adding exceeds available count (warehouse mode)
            if (isWarehouseMode) {
               const maxAvailable = product.count || 0;
               if (change > maxAvailable) {
                  toast.warning(`Faqat ${maxAvailable} ta mavjud!`, 3000);
                  return prevCart;
               }
            }

            // Add new item only if change is positive
            toast.success(`"${product.name}" dan ${change} ta savatga qo'shildi!`, 2000);
            return [...prevCart, {
               ...product,
               quantity: change
            }];
         }

         return prevCart;
      });
   };

   const getCartCount = () => {
      return cart.reduce((total, item) => total + item.quantity, 0);
   };

   const getCartTotal = () => {
      return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
   };

   // Barcode scanning functionality
   const startScanner = () => {
      if (!('navigator' in window && 'mediaDevices' in navigator)) {
         toast.error("Kamera qurilmangizda mavjud emas!", 3000);
         return;
      }

      setShowScanner(true);
      toast.info("Kamera ochildi. QR/shtrix-kodni skanerlang!", 3000);
   };

   const stopScanner = () => {
      setShowScanner(false);
   };

   const handleBarcodeDetected = (barcode) => {
      console.log("Barcode detected:", barcode);

      // Validate barcode format
      const cleanBarcode = barcode.trim();

      if (cleanBarcode.length >= 8 && cleanBarcode.length <= 13 && /^\d+$/.test(cleanBarcode)) {
         // Close scanner modal
         setShowScanner(false);

         // Set search term
         setSearchTerm(cleanBarcode);

         // Find matching products
         const matchingProducts = products.filter(product =>
            product.barcode && product.barcode.toString() === cleanBarcode
         );

         if (matchingProducts.length > 0) {
            const product = matchingProducts[0];

            // Auto-add to cart
            updateCartQuantity(product.card_id, 1);
            toast.success(`"${product.name}" savatga qo'shildi!`, 3000);

         } else {
            toast.info(`Ushbu shtrix-kod bilan mahsulot topilmadi: ${cleanBarcode}`, 4000);
         }
      } else {
         toast.warning(`Noto'g'ri shtrix-kod formati: ${cleanBarcode}`, 3000);
      }
   };

   const handleScannerError = (error) => {
      console.error('Scanner error:', error);
      toast.error('Kamerada xatolik yuz berdi. Iltimos, ruxsatlarni tekshiring.', 4000);
   };

   const confirmOrder = async (customerInfo) => {
      if (cart.length === 0) {
         toast.warning("Savat bo'sh!", 3000);
         return false;
      }

      if (!storeId) {
         toast.error("Do'kon ID topilmadi!", 3000);
         return false;
      }

      // Validate customer info
      if (!customerInfo.name || !customerInfo.name.trim()) {
         toast.error("Iltimos, ismingizni kiriting!", 3000);
         return false;
      }

      if (!customerInfo.phone || customerInfo.phone.replace(/\D/g, '').length < 9) {
         toast.error("Iltimos, to'liq telefon raqamingizni kiriting!", 3000);
         return false;
      }

      setIsSubmitting(true);
      toast.info("Buyurtma yuborilmoqda...", 0);

      // Clean phone number (remove formatting)
      const cleanPhone = customerInfo.phone.replace(/\D/g, '');

      const orderData = {
         data: cart.map(item => ({
            card_id: item.card_id,
            count: item.quantity,
         })),
         customer_info: {
            name: customerInfo.name.trim(),
            phone: cleanPhone
         }
      };

      const url = `${API_BASE_URL}/${storeId}`;
      console.log("POST to:", url, "DATA:", orderData);

      try {
         const res = await fetch(url, {
            method: "POST",
            mode: 'cors',
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
         });

         if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
         }

         const result = await res.json();
         console.log("Order response:", result);

         toast.success("✅ Buyurtma muvaffaqiyatli yuborildi!", 4000);
         setCart([]);
         setIsCartOpen(false);

         return true;

      } catch (err) {
         console.error("Order ERROR:", err);
         toast.error("❌ Buyurtma yuborilmadi! Internet yoki serverni tekshiring.", 5000);
         return false;
      } finally {
         setIsSubmitting(false);
         removeToast(toasts[toasts.length - 1]?.id);
      }
   };

   const getSampleProducts = () => {
      return [
         {
            card_id: 25912,
            name: "Соска CAMERA блок ЛЕНТА 12шт думалок",
            price: 24000,
            image: "https://via.placeholder.com/300x200",
            category: "Boshqa",
            barcode: 1234567890,
            count: isWarehouseMode ? 5 : 0
         },
         {
            card_id: 2523,
            name: "Smartphone Samsung Galaxy S23",
            price: 8500000,
            image: "https://via.placeholder.com/300x200",
            category: "Elektronika",
            barcode: 9876543210,
            count: isWarehouseMode ? 3 : 0
         }
      ];
   };

   const clearFilters = () => {
      setSearchTerm('');
      setSelectedCategory('all');
   };

   const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

   if (loading) {
      return <LoadingSkeleton />;
   }

   // Determine header title
   const getHeaderTitle = () => {
      if (isWarehouseMode) {
         return client.name || "Do'kon";
      }
      return "TujjorS";
   };

   // Determine page title
   const getPageTitle = () => {
      if (isWarehouseMode) {
         return "Omborxona";
      }
      return "Mahsulotlar";
   };

   return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
         {/* Toast Container */}
         <ToastContainer toasts={toasts} removeToast={removeToast} />

         {/* Barcode Scanner Component */}
         <BarcodeScanner
            isOpen={showScanner}
            onClose={stopScanner}
            onBarcodeDetected={handleBarcodeDetected}
            onError={handleScannerError}
         />

         {/* Header */}
         <header className="bg-linear-to-r from-yellow-500 to-orange-400 shadow-lg sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
               <div className="flex items-center justify-between">
                  {/* Mobile: Burger Menu + Title */}
                  <div className="flex items-center gap-2 lg:hidden">
                     <button
                        onClick={() => setShowCategoryMenu(true)}
                        className="p-2 text-white hover:text-gray-200 transition-colors"
                     >
                        <i className="fa-solid fa-bars text-lg"></i>
                     </button>
                     <div className="text-white">
                        <h1 className="text-lg font-bold line-clamp-1">{getHeaderTitle()}</h1>
                     </div>
                  </div>

                  {/* Desktop: Title */}
                  <div className="hidden lg:block">
                     <h1 className="text-2xl font-bold text-white line-clamp-1">
                        {getHeaderTitle()}
                     </h1>
                     {isWarehouseMode && (
                        <p className="text-white/80 text-sm">Omborxona boshqaruvi</p>
                     )}
                  </div>

                  {/* Search Bar - Hidden on mobile, show on sm and up */}
                  <div className="hidden sm:flex items-center gap-3 flex-1 lg:max-w-2xl mx-4">
                     <button
                        onClick={() => setShowCategoryMenu(true)}
                        className="hidden lg:flex items-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                     >
                        <i className="fa-solid fa-bars"></i>
                        <span>Kategoriyalar</span>
                     </button>

                     <SearchBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                     />

                     {/* Scanner Button for Desktop */}
                     <button
                        onClick={startScanner}
                        className="px-4 hidden md:block py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                        title="QR/Shtrix-kod skaneri"
                     >
                        <i className="fa-solid fa-qrcode"></i>
                     </button>

                     <button
                        onClick={() => setIsCartOpen(true)}
                        className="px-5 cursor-pointer text-white py-3.5 bg-linear-to-r from-orange-500 to-yellow-400 font-bold rounded-xl hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl relative"
                     >
                        <i className="fa-solid fa-cart-shopping"></i>
                        {getCartCount() > 0 && (
                           <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white">
                              {getCartCount()}
                           </span>
                        )}
                     </button>
                  </div>

                  {/* Mobile: Cart + Scanner Buttons */}
                  <div className="flex items-center gap-2 sm:hidden">
                     {/* Scanner Button - Now in header for mobile */}
                     <button
                        onClick={startScanner}
                        className="px-5 cursor-pointer text-white py-3.5 bg-linear-to-r from-orange-500 to-yellow-400 font-bold rounded-xl hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl"
                        title="QR/Shtrix-kod skaneri"
                     >
                        <i className="fa-solid fa-qrcode text-lg"></i>
                     </button>

                     <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative px-5 cursor-pointer text-white py-3.5 bg-linear-to-r from-orange-500 to-yellow-400 font-bold rounded-xl hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl"
                     >
                        <i className="fa-solid fa-cart-shopping text-lg"></i>
                        {getCartCount() > 0 && (
                           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                              {getCartCount()}
                           </span>
                        )}
                     </button>
                  </div>
               </div>

               {/* Mobile Search Bar - Show below on mobile */}
               <div className="sm:hidden mt-3">
                  <SearchBar
                     searchTerm={searchTerm}
                     onSearchChange={setSearchTerm}
                  />
               </div>
            </div>
         </header>

         {/* Category Menu Popup */}
         {showCategoryMenu && (
            <div className="fixed inset-0 z-50">
               <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowCategoryMenu(false)}
               />
               <div className="absolute left-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl transform transition-transform duration-300">
                  <div className="flex flex-col h-full">
                     <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Kategoriyalar</h2>
                        <button
                           onClick={() => setShowCategoryMenu(false)}
                           className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                           <i className="fa-solid fa-times text-xl"></i>
                        </button>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-2">
                           <button
                              onClick={() => {
                                 setSelectedCategory('all');
                                 setShowCategoryMenu(false);
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${selectedCategory === 'all'
                                 ? 'bg-orange-500 text-white shadow-lg'
                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                 }`}
                           >
                              <div className="flex items-center gap-3">
                                 <i className="fa-solid fa-grid text-lg"></i>
                                 <span className="font-medium">Barcha mahsulotlar</span>
                              </div>
                           </button>
                           {categories.filter(cat => cat !== 'all').map(category => (
                              <button
                                 key={category}
                                 onClick={() => {
                                    setSelectedCategory(category);
                                    setShowCategoryMenu(false);
                                 }}
                                 className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${selectedCategory === category
                                    ? 'bg-orange-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                    }`}
                              >
                                 <div className="flex items-center gap-3">
                                    <i className="fa-solid fa-folder text-lg"></i>
                                    <span className="font-medium">{category}</span>
                                 </div>
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="p-4 border-t border-gray-200">
                        <button
                           onClick={() => {
                              setSelectedCategory('all');
                              setShowCategoryMenu(false);
                           }}
                           className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                        >
                           Barchasini ko'rish
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Active Filters Info */}
         {(searchTerm || selectedCategory !== 'all') && (
            <div className="bg-white border-b border-gray-200">
               <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
                  <div className="flex flex-wrap items-center gap-2">
                     <span className="text-sm text-gray-600">Faol filtrlari:</span>
                     {searchTerm && (
                        <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                           Qidiruv: {searchTerm}
                           <button
                              onClick={() => setSearchTerm('')}
                              className="ml-1 text-orange-600 hover:text-orange-800"
                           >
                              ×
                           </button>
                        </span>
                     )}
                     {selectedCategory !== 'all' && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                           Kategoriya: {selectedCategory}
                           <button
                              onClick={() => setSelectedCategory('all')}
                              className="ml-1 text-green-600 hover:text-green-800"
                           >
                              ×
                           </button>
                        </span>
                     )}
                     {(searchTerm || selectedCategory !== 'all') && (
                        <button
                           onClick={clearFilters}
                           className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                        >
                           Tozalash
                        </button>
                     )}
                  </div>
               </div>
            </div>
         )}

         {/* Main Content */}
         <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex justify-between items-center">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                     {getPageTitle()} ({filteredProducts.length})
                  </h2>
                  {isWarehouseMode && (
                     <p className="text-gray-600 text-sm">
                        Jami: {products.reduce((sum, p) => sum + (p.count || 0), 0)} ta mahsulot mavjud
                     </p>
                  )}
                  {filteredProducts.length !== products.length && (
                     <p className="text-gray-600 text-sm">
                        {products.length} ta mahsulotdan {filteredProducts.length} tasi topildi
                     </p>
                  )}
               </div>
               
               {/* Cart Summary Button */}
               <button
                  onClick={() => setIsCartOpen(true)}
                  className="md:hidden px-4 py-2 bg-linear-to-r from-orange-500 to-yellow-400 text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-colors shadow-md"
               >
                  <i className="fa-solid fa-cart-shopping mr-2"></i>
                  {getCartCount()} ta • {new Intl.NumberFormat("uz-UZ").format(getCartTotal())} so'm
               </button>
            </div>

            {currentProducts.length === 0 ? (
               <div className="text-center py-16">
                  <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                     <i className="fa-solid fa-search text-6xl text-gray-300 mb-4"></i>
                     <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Hech qanday mahsulot topilmadi
                     </h3>
                     <p className="text-gray-600 mb-4">
                        {searchTerm || selectedCategory !== 'all'
                           ? "Qidiruv shartlari bo'yicha mahsulot topilmadi"
                           : "Ushbu do'konda hozircha mahsulotlar mavjud emas"
                        }
                     </p>
                     {(searchTerm || selectedCategory !== 'all') && (
                        <button
                           onClick={clearFilters}
                           className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                           Filtrlarni tozalash
                        </button>
                     )}
                  </div>
               </div>
            ) : (
               <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {currentProducts.map(product => (
                        <ProductCard
                           key={product.card_id}
                           product={product}
                           cart={cart}
                           onQuantityChange={updateCartQuantity}
                           showCount={isWarehouseMode} // Show available count only in warehouse mode
                        />
                     ))}
                  </div>

                  {totalPages > 1 && (
                     <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                     />
                  )}
               </>
            )}
         </main>

         {/* Cart Popup */}
         {isCartOpen && (
            <CartPopup
               cart={cart}
               onClose={() => setIsCartOpen(false)}
               onConfirmOrder={confirmOrder}
               isSubmitting={isSubmitting}
               storeName={isWarehouseMode ? client.name : "TujjorS"}
            />
         )}

         {/* Floating Cart Button for Mobile */}
         {getCartCount() > 0 && (
            <div className="lg:hidden fixed bottom-6 right-6 z-30">
               <button
                  onClick={() => setIsCartOpen(true)}
                  className="px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-400 text-white font-bold rounded-full shadow-2xl hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
               >
                  <i className="fa-solid fa-cart-shopping"></i>
                  <span>{getCartCount()} ta • {new Intl.NumberFormat("uz-UZ").format(getCartTotal())} so'm</span>
               </button>
            </div>
         )}

         {/* Footer */}
         <footer className="bg-gray-900 text-white py-6 mt-8">
            <div className="max-w-7xl mx-auto px-4 text-center">
               <p className="font-medium mb-2">
                  {isWarehouseMode ? (client.name || "Do'kon") : "TujjorS"}
               </p>
               <p className="text-sm text-gray-400">
                  {isWarehouseMode ? "Omborxona boshqaruvi" : "Online do'kon"}
               </p>
               <p className="text-sm text-gray-400 mt-2">&copy; 2024 TujjorS. Barcha huquqlar himoyalangan.</p>
            </div>
         </footer>
      </div>
   );
};

const LoadingSkeleton = () => (
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
         {[...Array(20)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
               <div className="h-48 bg-gray-300"></div>
               <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-12 bg-gray-300 rounded"></div>
               </div>
            </div>
         ))}
      </div>
   </div>
);

export default StoreFront;