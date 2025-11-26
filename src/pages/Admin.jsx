// pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminProductCard from '../components/AdminProductCard';
import ToastContainer from '../components/ToastContainer';
import useToast from '../hooks/useToast';

const API_BASE_URL = "https://tujjors.uz/api";

const Admin = () => {
  const { firstId, secondId } = useParams();
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();

  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modifiedProducts, setModifiedProducts] = useState(new Set());

  useEffect(() => {
    if (firstId && secondId) {
      fetchProducts();
    }
  }, [firstId, secondId]);

  // Test API connectivity
  const testAPIConnectivity = async () => {
    console.log("🔄 Testing API connectivity...");

    try {
      // Test if API server is reachable
      const testUrl = `${API_BASE_URL}/${firstId}/change/${secondId}`;

      const response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log("🔧 Direct API test result:", response.status);
      return response.ok;
    } catch (error) {
      console.error("❌ API connectivity test failed:", error);
      return false;
    }
  };

  // Simple fetch function with direct API calls
  const apiFetch = async (url, options = {}) => {
    const isGet = !options.method || options.method === 'GET';

    try {
      console.log(`📡 Making ${options.method || 'GET'} request to:`, url);

      const response = await fetch(url, {
        method: options.method || 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        body: options.body,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      console.log(`✅ ${options.method || 'GET'} request successful:`, data);
      return data;

    } catch (error) {
      console.error("🚨 API fetch error:", error);
      throw error;
    }
  };

  const fetchProducts = async () => {
    if (!firstId || !secondId) return;

    setLoading(true);

    try {
      // Test connectivity first
      const isConnected = await testAPIConnectivity();
      if (!isConnected) {
        throw new Error('API serverga ulanish imkoni boʻlmadi');
      }

      const url = `${API_BASE_URL}/${firstId}/change/${secondId}`;
      const data = await apiFetch(url);

      if (!data || typeof data !== "object" || data.status !== true || !Array.isArray(data.data)) {
        throw new Error("Invalid API response format");
      }

      const normalizedProducts = data.data.map(product => ({
        ...product,
        originalName: product.name,
        originalPrice: product.price
      }));

      setProducts(normalizedProducts);
      setOriginalProducts(normalizedProducts);

      toast.success(
        `Mahsulotlar muvaffaqiyatli yuklandi (${normalizedProducts.length} ta)`,
        3000
      );

    } catch (error) {
      console.error("Error fetching products:", error);

      let errorMessage = "Mahsulotlarni yuklashda xatolik!";
      if (error.message.includes('ulanish')) {
        errorMessage = "API serverga ulanish imkoni bo'lmadi. Server ishlamayotgan bo'lishi mumkin.";
      } else if (error.message.includes('Invalid API')) {
        errorMessage = "API dan noto'g'ri formatda ma'lumot qaytdi";
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = "Serverga ulanib bo'lmadi. Internet aloqasini tekshiring.";
      }

      toast.error(errorMessage, 5000);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = (productId, field, value) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product =>
        product.card_id === productId
          ? { ...product, [field]: value }
          : product
      );

      const updatedProduct = updatedProducts.find(p => p.card_id === productId);
      const originalProduct = originalProducts.find(p => p.card_id === productId);

      if (updatedProduct && originalProduct) {
        const isModified = updatedProduct.name !== originalProduct.name ||
          updatedProduct.price !== originalProduct.price;

        setModifiedProducts(prev => {
          const newSet = new Set(prev);
          if (isModified) {
            newSet.add(productId);
          } else {
            newSet.delete(productId);
          }
          return newSet;
        });
      }

      return updatedProducts;
    });
  };

  const saveProduct = async (productId) => {
    const product = products.find(p => p.card_id === productId);
    const originalProduct = originalProducts.find(p => p.card_id === productId);

    if (!product || !originalProduct) return;

    if (product.name === originalProduct.name && product.price === originalProduct.price) {
      toast.warning('Mahsulotda o\'zgartirishlar mavjud emas!', 3000);
      return;
    }

    setSaving(true);

    try {
      const url = `${API_BASE_URL}/${firstId}/change/${secondId}`;

      const requestData = {
        items: [{
          card_id: product.card_id,
          name: product.name,
          price: product.price
        }]
      };

      console.log("📦 Sending POST data:", requestData);

      const result = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify(requestData)
      });

      console.log("📨 POST response:", result);

      // Update original products with new values
      setOriginalProducts(prev =>
        prev.map(p => p.card_id === productId ? { ...p, name: product.name, price: product.price } : p)
      );

      setModifiedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });

      toast.success(`"${product.name}" muvaffaqiyatli yangilandi!`, 3000);

    } catch (error) {
      console.error("💥 Save product error:", error);

      let errorMessage = "Mahsulotni saqlashda xatolik!";
      if (error.message.includes('Failed to fetch')) {
        errorMessage = "Serverga ulanib bo'lmadi. Internet aloqasini tekshiring.";
      }

      toast.error(errorMessage, 5000);
    } finally {
      setSaving(false);
    }
  };

  const saveAllProducts = async () => {
    if (modifiedProducts.size === 0) {
      toast.warning('O\'zgartirilgan mahsulotlar mavjud emas!', 3000);
      return;
    }

    const total = modifiedProducts.size;
    setSaving(true);
    toast.info(`Barcha ${total} ta mahsulot saqlanmoqda...`, 0);

    try {
      const url = `${API_BASE_URL}/${firstId}/change/${secondId}`;

      const modifiedItems = Array.from(modifiedProducts).map(id => {
        const product = products.find(p => p.card_id === id);
        return {
          card_id: product.card_id,
          name: product.name,
          price: product.price
        };
      });

      const requestData = { items: modifiedItems };

      console.log("📦 Saving all products:", requestData);

      const result = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify(requestData)
      });

      console.log("📨 Save all response:", result);

      // Update all original products
      setOriginalProducts(prev =>
        prev.map(p => {
          const updatedProduct = products.find(mp => mp.card_id === p.card_id);
          if (updatedProduct) {
            return {
              ...p,
              name: updatedProduct.name,
              price: updatedProduct.price
            };
          }
          return p;
        })
      );

      setModifiedProducts(new Set());
      toast.success(`Barcha ${modifiedItems.length} ta mahsulot muvaffaqiyatli yangilandi!`, 4000);

    } catch (error) {
      console.error("💥 Save all products error:", error);

      let errorMessage = "Mahsulotlarni saqlashda xatolik!";
      if (error.message.includes('Failed to fetch')) {
        errorMessage = "Serverga ulanib bo'lmadi. Internet aloqasini tekshiring.";
      }

      toast.error(errorMessage, 5000);
    } finally {
      setSaving(false);
      removeToast(toasts[toasts.length - 1]?.id);
    }
  };

  const isProductModified = (productId) => {
    return modifiedProducts.has(productId);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Optimized Header for Mobile */}
      <header className="bg-linear-to-r from-orange-500 to-yellow-400 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo that navigates to main page */}
            <button
              onClick={() => navigate('/01a0c8271f6c4e77/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                <span className="text-white">Tujjor</span>S
              </span>
            </button>

            {/* Save All Button - Always on same line */}
            <button
              onClick={saveAllProducts}
              disabled={saving || modifiedProducts.size === 0}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg disabled:hover:shadow-none disabled:cursor-not-allowed sm:px-6 sm:py-3 sm:text-base"
            >
              <i className="fa-solid fa-floppy-disk text-xs sm:text-sm"></i>
              Barchasini saqlash ({modifiedProducts.size})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with Mobile Optimizations */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards - Stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 flex items-center gap-3 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-r from-orange-500 to-yellow-400 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-cube text-lg sm:text-2xl text-gray-900"></i>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{products.length}</h3>
              <p className="text-sm sm:text-base text-gray-600">Jami mahsulotlar</p>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 flex items-center gap-3 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-r from-orange-500 to-yellow-400 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-edit text-lg sm:text-2xl text-gray-900"></i>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{modifiedProducts.size}</h3>
              <p className="text-sm sm:text-base text-gray-600">O'zgartirilgan</p>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8 sm:py-16">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 max-w-md mx-auto">
              <i className="fa-solid fa-inbox text-4xl sm:text-6xl text-gray-300 mb-3 sm:mb-4"></i>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                Hech qanday mahsulot topilmadi
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Ushbu do'konda hozircha mahsulotlar mavjud emas
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {products.map(product => (
              <AdminProductCard
                key={product.card_id}
                product={product}
                isModified={isProductModified(product.card_id)}
                onUpdate={(field, value) => updateProduct(product.card_id, field, value)}
                onSave={() => saveProduct(product.card_id)}
                isSaving={saving}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm sm:text-base">&copy; 2024 TS-TujjorS Admin Panel. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
};

// Updated Loading Skeleton for Mobile
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-linear-to-r from-orange-500 to-yellow-400 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="h-6 sm:h-8 bg-white bg-opacity-50 rounded w-32 sm:w-48 animate-pulse"></div>
          <div className="h-8 sm:h-10 bg-white bg-opacity-50 rounded w-24 sm:w-32 animate-pulse"></div>
        </div>
      </div>
    </header>

    <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 sm:h-8 bg-gray-300 rounded w-12 sm:w-16"></div>
              <div className="h-3 sm:h-4 bg-gray-300 rounded w-16 sm:w-24"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-40 sm:h-48 bg-gray-300"></div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="h-3 sm:h-4 bg-gray-300 rounded w-16 sm:w-20"></div>
              <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-8 sm:h-10 bg-gray-300 rounded w-1/2"></div>
              <div className="h-10 sm:h-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>
);

export default Admin;