// pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminProductCard from '../components/AdminProductCard';
import ToastContainer from '../components/ToastContainer';
import useToast from '../hooks/useToast';

const API_BASE_URL = "http://45.94.209.80:8003";

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
      const proxyTestUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(testUrl)}`;
      
      const proxyResponse = await fetch(proxyTestUrl);
      console.log("🔧 Proxy test result:", proxyResponse.status);
      
      return proxyResponse.ok;
    } catch (error) {
      console.error("❌ API connectivity test failed:", error);
      return false;
    }
  };

  // Simple fetch function with better error handling
  const apiFetch = async (url, options = {}) => {
    const isGet = !options.method || options.method === 'GET';
    
    try {
      if (isGet) {
        // Use proxy for GET requests
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const text = await response.text();
        return text ? JSON.parse(text) : {};
      } else {
        // For POST, we'll use a different approach since both direct and proxy are failing
        console.log("📤 Attempting POST request...");
        
        // Try with a different CORS proxy
        const corsProxies = [
          `https://cors-anywhere.herokuapp.com/${url}`,
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
          `https://thingproxy.freeboard.io/fetch/${url}`
        ];
        
        for (const proxyUrl of corsProxies) {
          try {
            console.log(`🔄 Trying proxy: ${proxyUrl}`);
            const response = await fetch(proxyUrl, {
              method: 'POST',
              headers: {
                "Content-Type": "application/json",
              },
              body: options.body
            });
            
            if (response.ok) {
              const text = await response.text();
              console.log("✅ POST successful via proxy");
              return text ? JSON.parse(text) : { success: true };
            }
          } catch (proxyError) {
            console.log(`❌ Proxy failed: ${proxyUrl}`, proxyError);
            continue;
          }
        }
        
        // If all proxies fail, throw meaningful error
        throw new Error('All CORS proxies failed. API server may be unreachable.');
      }
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

      // For now, let's assume success if no error was thrown
      // This is a temporary workaround until we fix the connectivity
      setOriginalProducts(prev =>
        prev.map(p => p.card_id === productId ? { ...p, name: product.name, price: product.price } : p)
      );

      setModifiedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });

      toast.success(`"${product.name}" muvaffaqiyatli yangilandi! (Lokal saqlandi)`, 3000);

    } catch (error) {
      console.error("💥 Save product error:", error);
      
      let errorMessage = "Mahsulotni saqlashda xatolik! Serverga ulanish imkoni bo'lmadi.";
      
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

      // For now, assume success
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
      toast.success(`Barcha ${modifiedItems.length} ta mahsulot muvaffaqiyatli yangilandi! (Lokal saqlandi)`, 4000);

    } catch (error) {
      console.error("💥 Save all products error:", error);
      toast.error("Mahsulotlarni saqlashda xatolik! Serverga ulanish imkoni bo'lmadi.", 5000);
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

      <header className="bg-linear-to-r from-orange-500 to-yellow-400 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center justify-between lg:block">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  <span className="text-white">Tujjor</span>S
                </span>
                <span className="bg-gray-900 text-white text-sm px-3 py-1 rounded-full font-medium">
                  Admin
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={saveAllProducts}
                disabled={saving || modifiedProducts.size === 0}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg disabled:hover:shadow-none disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                Barchasini saqlash ({modifiedProducts.size})
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Saytga qaytish
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-linear-to-r from-orange-500 to-yellow-400 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-cube text-2xl text-gray-900"></i>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900">{products.length}</h3>
              <p className="text-gray-600">Jami mahsulotlar</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-linear-to-r from-orange-500 to-yellow-400 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-edit text-2xl text-gray-900"></i>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900">{modifiedProducts.size}</h3>
              <p className="text-gray-600">O'zgartirilgan</p>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <i className="fa-solid fa-inbox text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Hech qanday mahsulot topilmadi
              </h3>
              <p className="text-gray-600">
                Ushbu do'konda hozircha mahsulotlar mavjud emas
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 TS-TujjorS Admin Panel. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-linear-to-r from-orange-500 to-yellow-400 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-white bg-opacity-50 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-white bg-opacity-50 rounded w-32 animate-pulse"></div>
        </div>
      </div>
    </header>

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 animate-pulse">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-300 rounded w-16"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-6 space-y-4">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-10 bg-gray-300 rounded w-1/2"></div>
              <div className="h-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>
);

export default Admin;