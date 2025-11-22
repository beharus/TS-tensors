// components/StoreFront.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import CartPopup from './CartPopup';
import FloatingCart from './FloatingCart';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import ToastContainer from './ToastContainer';
import useToast from '../hooks/useToast';

const API_BASE_URL = "http://45.94.209.80:8003";

const StoreFront = ({ storeId }) => {
   const navigate = useNavigate();
   const { toasts, toast, removeToast } = useToast();
   const [products, setProducts] = useState([]);
   const [filteredProducts, setFilteredProducts] = useState([]);
   const [cart, setCart] = useState([]);
   const [loading, setLoading] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const [currentPage, setCurrentPage] = useState(1);
   const [isCartOpen, setIsCartOpen] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const itemsPerPage = 8;

   useEffect(() => {
      if (storeId) {
         fetchProducts();
      }
   }, [storeId]);

   useEffect(() => {
      const filtered = searchTerm
         ? products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
         )
         : products;
      setFilteredProducts(filtered);
      setCurrentPage(1);
   }, [searchTerm, products]);

   const fetchProducts = async () => {
      if (!storeId) return;

      setLoading(true);

      try {
         const url = `${API_BASE_URL}/${storeId}`;
         const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

         // Try fetching via AllOrigins
         const response = await fetch(proxiedUrl);

         // Validate response
         if (!response.ok) {
            console.warn("AllOrigins failed, status:", response.status);
            throw new Error("Proxy failed");
         }

         let data;
         try {
            data = await response.json();
         } catch (err) {
            console.error("JSON parse failed:", err);
            throw new Error("Invalid JSON");
         }

         // Validate API structure
         if (!data || !Array.isArray(data.cards)) {
            console.warn("Invalid API structure:", data);
            throw new Error("Invalid API response");
         }

         // Transform products
         const transformed = data.cards.map(item => ({
            card_id: item.card_id ?? 0,
            name: item.name ?? "Nomaʼlum mahsulot",
            price: item.price ?? 0,
            image: fixImageUrl(item.image) || "https://via.placeholder.com/300x200",
         }));

         setProducts(transformed);
         toast.success("Mahsulotlar muvaffaqiyatli yuklandi!", 3000);
      } catch (error) {
         console.error("Error fetching products:", error);
         toast.error("Mahsulotlarni yuklashda xatolik. Namoyish uchun misol ma'lumotlar yuklandi.", 5000);
         setProducts(getSampleProducts());
      } finally {
         setLoading(false);
      }
   };

   const fixImageUrl = (url) => {
      if (!url) return "";
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

   const confirmOrder = async (customerInfo) => {
      if (cart.length === 0) {
         toast.warning("Savat bo'sh!", 3000);
         return;
      }

      if (!storeId) {
         toast.error("Do'kon ID topilmadi!", 3000);
         return;
      }

      // Validate customer info
      if (!customerInfo.name || !customerInfo.name.trim()) {
         toast.error("Iltimos, ismingizni kiriting!", 3000);
         return;
      }

      if (!customerInfo.phone || customerInfo.phone.replace(/\D/g, '').length < 9) {
         toast.error("Iltimos, to'liq telefon raqamingizni kiriting!", 3000);
         return;
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
         await fetch(url, {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData),
            mode: "no-cors"
         });

         toast.success("✅ Buyurtma muvaffaqiyatli yuborildi!", 4000);
         setCart([]);
         setIsCartOpen(false);

      } catch (err) {
         console.error("Order ERROR:", err);
         toast.error("❌ Buyurtma yuborilmadi! Internet yoki serverni tekshiring.", 5000);
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
         },
         {
            card_id: 2523,
            name: "Smartphone Samsung Galaxy S23",
            price: 8500000,
            image: "https://via.placeholder.com/300x200",
         }
      ];
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

         {/* Main Content */}
         <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {currentProducts.length === 0 ? (
               <div className="text-center py-16">
                  <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                     <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Hech qanday mahsulot topilmadi
                     </h3>
                     <p className="text-gray-600">
                        {searchTerm ? "Qidiruv bo'yicha mahsulot topilmadi" : "Ushbu do'konda hozircha mahsulotlar mavjud emas"}
                     </p>
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