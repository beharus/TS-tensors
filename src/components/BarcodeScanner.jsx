// components/BarcodeScanner.jsx
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const BarcodeScanner = ({
  isOpen,
  onClose,
  onBarcodeDetected,
  onError
}) => {
  const videoRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());
  const streamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);
  const [showPermissionScreen, setShowPermissionScreen] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Show permission screen first if not already asked
      if (!permissionAsked) {
        setShowPermissionScreen(true);
      } else {
        startScanner();
      }
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, permissionAsked]);

  // 🔥 STEP 1: Explicit permission request on button click
  const askBrowserPermission = async () => {
    try {
      console.log('📸 Requesting camera permission...');
      
      // This WILL trigger the browser's native permission popup
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      
      // Immediately stop the stream - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      console.log('✅ Permission granted!');
      setPermissionAsked(true);
      setShowPermissionScreen(false);
      setHasPermission(true);
      
      // Start the actual scanner
      startScanner();
      
    } catch (err) {
      console.error('❌ Permission denied:', err);
      setCameraError("Kameraga ruxsat berilmadi. Iltimos, brauzer sozlamalaridan ruxsat bering.");
      setPermissionAsked(true);
    }
  };

  const startScanner = async () => {
    if (!isOpen || !hasPermission) return;

    try {
      setCameraError(null);
      setIsScanning(true);

      console.log('🔄 Starting scanner with permission...');

      // Now get the actual stream for scanning
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      // Set up video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        
        await new Promise((resolve) => {
          if (videoRef.current.readyState >= 4) {
            resolve();
          } else {
            videoRef.current.onloadedmetadata = resolve;
          }
        });

        await videoRef.current.play();
      }

      // Start ZXing decoding
      console.log('🎯 Starting ZXing decoding...');
      
      codeReader.current.decodeFromVideoElement(
        videoRef.current,
        (result, err) => {
          if (result) {
            console.log('🎉 Barcode detected:', result.getText());
            handleSuccessfulScan(result.getText());
          }
          
          if (err && !err.message?.includes('NotFoundException')) {
            console.warn('Scanning error:', err);
          }
        }
      );

      console.log('✅ Scanner started successfully!');

    } catch (error) {
      console.error('❌ Scanner failed:', error);
      handleScannerError(error);
    }
  };

  const handleSuccessfulScan = (barcode) => {
    console.log('✅ Scan successful:', barcode);
    stopScanner();
    onBarcodeDetected(barcode);
  };

  const handleScannerError = (error) => {
    if (error.name === 'NotAllowedError') {
      setCameraError("Kameraga ruxsat berilmadi. Iltimos, brauzer sozlamalaridan ruxsat bering.");
    } else if (error.name === 'NotFoundError') {
      setCameraError("Kamera topilmadi.");
    } else {
      setCameraError("Kamerani ishga tushirib bo'lmadi.");
    }
    
    onError?.(error);
    setIsScanning(false);
  };

  const stopScanner = () => {
    console.log('🛑 Stopping scanner...');

    try {
      codeReader.current.reset();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setIsScanning(false);
      setCameraError(null);

    } catch (error) {
      console.warn('Error stopping scanner:', error);
    }
  };

  const handleRetry = async () => {
    console.log('🔄 Retrying camera...');
    stopScanner();
    
    if (!hasPermission) {
      // Go back to permission screen
      setShowPermissionScreen(true);
      setCameraError(null);
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      startScanner();
    }
  };

  const openCameraSettings = () => {
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      alert("Safari sozlamalariga o'ting: Sozlamalar > Safari > Kamera > Ushbu saytga ruxsat bering");
    } else {
      alert("Brauzer sozlamalariga o'ting: Site settings > Camera > Allow");
    }
  };

  const handleClose = () => {
    stopScanner();
    setShowPermissionScreen(true);
    setPermissionAsked(false);
    setHasPermission(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">
            📷 QR / Shtrix-kod Skaneri
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Yopish"
          >
            <i className="fa-solid fa-times text-xl text-gray-500"></i>
          </button>
        </div>

        {/* PERMISSION SCREEN */}
        {showPermissionScreen && (
          <div className="p-6 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-camera text-3xl text-blue-600"></i>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                Kameraga Ruxsat Kerak
              </h4>
              <p className="text-gray-600 mb-4">
                QR kod va shtrix-kodlarni skaner qilish uchun kamerangizdan foydalanishimizga ruxsat bering.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 text-left text-sm text-blue-800 mb-6">
                <p className="font-medium mb-2">📱 Qanday ishlaydi:</p>
                <ul className="space-y-1">
                  <li>• "Ruxsat berish" tugmasini bosing</li>
                  <li>• Brauzerning ruxsat so'roviga "Allow" deb javob bering</li>
                  <li>• Skaner avtomatik ravishda ishga tushadi</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={askBrowserPermission}
                className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-lg flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-camera"></i>
                Kameraga Ruxsat Berish
              </button>
              
              <button
                onClick={handleClose}
                className="w-full py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
              >
                Orqaga Qaytish
              </button>
            </div>

            {cameraError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{cameraError}</p>
                <button
                  onClick={openCameraSettings}
                  className="mt-2 text-red-600 text-sm underline hover:text-red-800"
                >
                  Sozlamalarni ochish
                </button>
              </div>
            )}
          </div>
        )}

        {/* SCANNER SCREEN */}
        {!showPermissionScreen && hasPermission && (
          <>
            {/* Scanner View */}
            <div className="relative bg-black aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                autoPlay
              />

              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-40">
                  <div className="w-full h-full border-2 border-green-400 rounded-xl"></div>
                  <div className="absolute left-2 right-2 top-0 h-1 bg-green-400 rounded-full shadow-[0_0_12px_rgba(74,222,128,0.9)] animate-scan-line"></div>
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-green-400 rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-green-400 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-green-400 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-green-400 rounded-br-lg"></div>
                </div>
              </div>

              {/* Loading State */}
              {!isScanning && !cameraError && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                    <p className="text-lg font-medium">Kamera ochilmoqda...</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {cameraError && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
                  <div className="text-center text-white max-w-sm">
                    <i className="fa-solid fa-camera-slash text-5xl mb-4 text-red-400"></i>
                    <p className="text-lg font-medium mb-3">Xatolik</p>
                    <p className="text-sm mb-4">{cameraError}</p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleRetry}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                      >
                        🔄 Qayta urinish
                      </button>
                      <button
                        onClick={() => setShowPermissionScreen(true)}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      >
                        ⚙️ Ruxsatni so'rash
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="p-4 text-center bg-white">
              <p className="font-medium text-gray-700">
                QR yoki shtrix-kodni ramkaga qaratib turing
              </p>
              {isScanning && (
                <p className="text-sm text-gray-500 mt-1">
                  Kod avtomatik ravishda skanerlanadi
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                >
                  Qayta urinish
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
                >
                  Yopish
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;