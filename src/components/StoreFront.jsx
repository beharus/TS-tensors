// components/StoreFront.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import CartPopup from './CartPopup';
import FloatingCart from './FloatingCart';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import ToastContainer from './ToastContainer';
import useToast from '../hooks/useToast';

const API_BASE_URL = "https://tujjors.uz/api";

const StoreFront = ({ storeId }) => {
   const navigate = useNavigate();
   const { toasts, toast, removeToast } = useToast();
   const [products, setProducts] = useState([]);
   const [filteredProducts, setFilteredProducts] = useState([]);
   const [cart, setCart] = useState([]);
   const [loading, setLoading] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const [barcodeSearch, setBarcodeSearch] = useState('');
   const [currentPage, setCurrentPage] = useState(1);
   const [isCartOpen, setIsCartOpen] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [selectedCategory, setSelectedCategory] = useState('all');
   const [categories, setCategories] = useState([]);
   const [showScanner, setShowScanner] = useState(false);
   const [scanning, setScanning] = useState(false);
   const videoRef = useRef(null);
   const streamRef = useRef(null);
   const itemsPerPage = 8;

   useEffect(() => {
      if (storeId) {
         fetchProducts();
      }
   }, [storeId]);

   useEffect(() => {
      filterProducts();
   }, [searchTerm, barcodeSearch, selectedCategory, products]);

   const fetchProducts = async () => {
      if (!storeId) return;

      setLoading(true);

      try {
         const url = `${API_BASE_URL}/${storeId}`;
         console.log("Fetching from:", url);
         const response = await fetch(url);

         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }

         const data = await response.json();
         console.log("API Response:", data);

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
            barcode: item.barcode || null
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
      } finally {
         setLoading(false);
      }
   };

   const filterProducts = () => {
      let filtered = products;

      // Filter by search term (name)
      if (searchTerm) {
         filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
         );
      }

      // Filter by barcode
      if (barcodeSearch) {
         filtered = filtered.filter(product =>
            product.barcode && product.barcode.toString().includes(barcodeSearch)
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

   // Camera scanning functionality
   const startScanner = async () => {
      if (!('navigator' in window && 'mediaDevices' in navigator)) {
         toast.error("Kamera qurilmangizda mavjud emas!", 3000);
         return;
      }

      try {
         setScanning(true);
         setShowScanner(true);
         
         const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
         });
         
         streamRef.current = stream;
         if (videoRef.current) {
            videoRef.current.srcObject = stream;
         }
         
         toast.info("Kamera ochildi. Skaner ishga tushdi.", 3000);
      } catch (error) {
         console.error("Camera error:", error);
         toast.error("Kamerani ochib bo'lmadi. Ruxsatni tekshiring!", 5000);
         setShowScanner(false);
         setScanning(false);
      }
   };

   const stopScanner = () => {
      if (streamRef.current) {
         streamRef.current.getTracks().forEach(track => track.stop());
         streamRef.current = null;
      }
      setShowScanner(false);
      setScanning(false);
   };

   const handleBarcodeDetected = (barcode) => {
      setBarcodeSearch(barcode);
      setShowScanner(false);
      stopScanner();
      toast.success(`Skaner qidiruvi: ${barcode}`, 3000);
   };

   // Manual barcode input simulation (in real app, use a barcode scanner library)
   const simulateBarcodeScan = () => {
      const sampleBarcodes = ['4607002050468', '1234567890', '9876543210'];
      const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
      handleBarcodeDetected(randomBarcode);
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
         setIsCartOpen(false); // This closes the popup

         return true; // Return success

      } catch (err) {
         console.error("Order ERROR:", err);
         toast.error("❌ Buyurtma yuborilmadi! Internet yoki serverni tekshiring.", 5000);
         return false; // Return failure
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
            barcode: 1234567890
         },
         {
            card_id: 2523,
            name: "Smartphone Samsung Galaxy S23",
            price: 8500000,
            image: "https://via.placeholder.com/300x200",
            category: "Elektronika",
            barcode: 9876543210
         }
      ];
   };

   const clearFilters = () => {
      setSearchTerm('');
      setBarcodeSearch('');
      setSelectedCategory('all');
   };

   const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

   if (loading) {
      return <LoadingSkeleton />;
   }

   return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
         {/* Toast Container */}
         <ToastContainer toasts={toasts} removeToast={removeToast} />

         {/* Header */}
         <header className="bg-linear-to-r from-yellow-500 to-orange-400 shadow-lg sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center justify-between lg:block">
                     <a href="/" className="text-2xl font-bold text-gray-900">
                        <span className="text-white">Tujjor</span>S
                     </a>
                     <button
                        onClick={() => navigate('/')}
                        className="lg:hidden text-white text-sm hover:text-gray-200 transition-colors"
                     >
                        ← Ortga
                     </button>
                  </div>

                  <SearchBar
                     searchTerm={searchTerm}
                     onSearchChange={setSearchTerm}
                  />
               </div>
            </div>
         </header>

         {/* Search Filters Section */}
         <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
               <div className="flex flex-col lg:flex-row gap-4">
                  
                  {/* Category Filter */}
                  <div className="flex-1">
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategoriya
                     </label>
                     <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                     >
                        {categories.map(category => (
                           <option key={category} value={category}>
                              {category === 'all' ? 'Barcha kategoriyalar' : category}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* Barcode Search */}
                  <div className="flex-1">
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shtrix-kod qidirish
                     </label>
                     <div className="flex gap-2">
                        <input
                           type="text"
                           value={barcodeSearch}
                           onChange={(e) => setBarcodeSearch(e.target.value)}
                           placeholder="Shtrix-kodni kiriting"
                           className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <button
                           onClick={startScanner}
                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                           <i className="fa-solid fa-camera"></i>
                           Skaner
                        </button>
                     </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                     <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                     >
                        <i className="fa-solid fa-times"></i>
                        Tozalash
                     </button>
                  </div>
               </div>

               {/* Active Filters Info */}
               {(searchTerm || barcodeSearch || selectedCategory !== 'all') && (
                  <div className="mt-3 flex flex-wrap gap-2">
                     {searchTerm && (
                        <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                           Nomi: {searchTerm}
                           <button onClick={() => setSearchTerm('')} className="ml-1 text-orange-600 hover:text-orange-800">
                              ×
                           </button>
                        </span>
                     )}
                     {barcodeSearch && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                           Shtrix-kod: {barcodeSearch}
                           <button onClick={() => setBarcodeSearch('')} className="ml-1 text-blue-600 hover:text-blue-800">
                              ×
                           </button>
                        </span>
                     )}
                     {selectedCategory !== 'all' && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                           Kategoriya: {selectedCategory}
                           <button onClick={() => setSelectedCategory('all')} className="ml-1 text-green-600 hover:text-green-800">
                              ×
                           </button>
                        </span>
                     )}
                  </div>
               )}
            </div>
         </div>

         {/* Barcode Scanner Modal */}
         {showScanner && (
            <div className="fixed inset-0 bg-black/75 bg-opacity-75 flex items-center justify-center z-50">
               <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold">Shtrix-kod skaneri</h3>
                     <button
                        onClick={stopScanner}
                        className="text-gray-500 hover:text-gray-700"
                     >
                        <i className="fa-solid fa-times text-xl"></i>
                     </button>
                  </div>
                  
                  <div className="bg-black/50 rounded-lg overflow-hidden mb-4">
                     <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover"
                     />
                  </div>
                  
                  <div className="text-center text-gray-600 mb-4">
                     {scanning ? (
                        <p>Kamera qurilmaga qaratiling va shtrix-kodni skanerlang</p>
                     ) : (
                        <p>Kamera yuklanmoqda...</p>
                     )}
                  </div>
                  
                  <div className="flex gap-2">
                     <button
                        onClick={simulateBarcodeScan}
                        className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                     >
                        Test skanerlash
                     </button>
                     <button
                        onClick={stopScanner}
                        className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                     >
                        Yopish
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Main Content */}
         <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {/* Results Info */}
            <div className="mb-6 flex justify-between items-center">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                     Mahsulotlar ({filteredProducts.length})
                  </h2>
                  {filteredProducts.length !== products.length && (
                     <p className="text-gray-600 text-sm">
                        {products.length} ta mahsulotdan {filteredProducts.length} tasi topildi
                     </p>
                  )}
               </div>
            </div>

            {currentProducts.length === 0 ? (
               <div className="text-center py-16">
                  <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                     <i className="fa-solid fa-search text-6xl text-gray-300 mb-4"></i>
                     <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Hech qanday mahsulot topilmadi
                     </h3>
                     <p className="text-gray-600 mb-4">
                        {searchTerm || barcodeSearch || selectedCategory !== 'all' 
                           ? "Qidiruv shartlari bo'yicha mahsulot topilmadi" 
                           : "Ushbu do'konda hozircha mahsulotlar mavjud emas"
                        }
                     </p>
                     {(searchTerm || barcodeSearch || selectedCategory !== 'all') && (
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
                        />
                     ))}
                  </div>

                  <Pagination
                     currentPage={currentPage}
                     totalPages={totalPages}
                     onPageChange={setCurrentPage}
                  />
               </>
            )}
         </main>

         {/* Floating Cart */}
         <FloatingCart
            cartCount={getCartCount()}
            onCartClick={() => setIsCartOpen(true)}
         />

         {/* Cart Popup */}
         {isCartOpen && (
            <CartPopup
               cart={cart}
               onClose={() => setIsCartOpen(false)}
               onConfirmOrder={confirmOrder}
               isSubmitting={isSubmitting}
            />
         )}

         {/* Footer */}
         <footer className="bg-gray-900 text-white py-6">
            <div className="max-w-7xl mx-auto px-4 text-center">
               <p>&copy; 2024 TS-TujjorS. Barcha huquqlar himoyalangan.</p>
            </div>
         </footer>
      </div>
   );
};

const LoadingSkeleton = () => (
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {[...Array(8)].map((_, index) => (
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