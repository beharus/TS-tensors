// components/StoreIdForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StoreIdForm = () => {
  const [storeId, setStoreId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!storeId.trim()) {
      alert("Iltimos, do'kon ID sini kiriting!");
      return;
    }
    
    if (!/^[a-zA-Z0-9]{16}$/.test(storeId)) {
      alert("Do'kon ID 16 ta harf va raqamdan iborat bo'lishi kerak!");
      return;
    }
    
    navigate(`/${storeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-linear-to-r from-orange-500 to-yellow-400 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center">
            <a href="/" className="text-3xl font-bold text-gray-900">
              TS<span className="text-white">Tujjor</span>S
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Do'kon ID sini kiriting
            </h2>
            <p className="text-gray-600 text-lg">
              Do'kon identifikatorini kiriting va mahsulotlarni ko'ring
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                placeholder="Do'kon ID (masalan: a4e4f21d322b43d3)"
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-3 focus:ring-orange-200 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400"
                maxLength={16}
              />
              <button
                type="submit"
                className="px-8 py-4 bg-linear-to-r from-orange-500 to-yellow-400 text-gray-900 font-bold rounded-2xl hover:from-orange-600 hover:to-yellow-500 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Yuklash
              </button>
            </div>
          </form>
          
          <p className="text-center text-gray-500 mt-6 text-sm">
            Masalan: <strong className="text-gray-700">a4e4f21d322b43d3</strong>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 TS-TujjorS. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
};

export default StoreIdForm;