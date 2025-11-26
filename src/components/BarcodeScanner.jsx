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

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    if (!isOpen) return;

    try {
      setCameraError(null);
      setIsScanning(true);
      setHasPermission(false);

      console.log('🔄 Starting camera...');

      // 🔥 STEP 1: Force camera permission FIRST - this triggers the browser popup
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      setHasPermission(true);

      // 🔥 STEP 2: Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // iOS fix
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current.readyState >= 4) {
            resolve();
          } else {
            videoRef.current.onloadedmetadata = resolve;
          }
        });

        await videoRef.current.play();
      }

      console.log('✅ Camera started successfully');

      // 🔥 STEP 3: Start ZXing decoding from the ACTIVE video stream
      codeReader.current.decodeFromVideoElement(
        videoRef.current,
        (result, error) => {
          if (result) {
            console.log('🎉 Barcode detected:', result.getText());
            handleSuccessfulScan(result.getText());
          }
          
          if (error) {
            // Ignore "NotFoundException" - it's just "no barcode found yet"
            if (!error.message?.includes('NotFoundException')) {
              console.warn('Scanning error:', error);
            }
          }
        }
      );

    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      
      // Handle specific error types
      if (error.name === 'NotAllowedError') {
        setCameraError('Kameraga ruxsat bermadingiz. Iltimos, brauzer sozlamalaridan ruxsat bering.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('Kamera topilmadi. Qurilmangizda kamera mavjud emas.');
      } else if (error.name === 'NotSupportedError') {
        setCameraError('Brauzeringiz kamerani qoʻllab-quvvatlamaydi.');
      } else if (error.name === 'NotReadableError') {
        setCameraError('Kamera band yoki ishlamayapti. Boshqa dastur kameredan foydalanayotgan boʻlishi mumkin.');
      } else {
        setCameraError('Kamerani ishga tushirib boʻlmadi. Iltimos, qayta urinib koʻring.');
      }
      
      onError?.(error);
      setIsScanning(false);
    }
  };

  const handleSuccessfulScan = (barcode) => {
    console.log('✅ Scan successful, stopping scanner...');
    stopScanner();
    onBarcodeDetected(barcode);
  };

  const stopScanner = () => {
    console.log('🛑 Stopping scanner...');
    
    try {
      // Stop ZXing decoding
      codeReader.current.reset();
      
      // Stop all video tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setIsScanning(false);
      setHasPermission(false);
      setCameraError(null);
      
    } catch (error) {
      console.warn('Error stopping scanner:', error);
    }
  };

  const handleRetry = async () => {
    console.log('🔄 Retrying camera...');
    stopScanner();
    // Small delay to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 300));
    startScanner();
  };

  const getErrorMessage = () => {
    if (cameraError) return cameraError;
    
    if (!hasPermission && !cameraError) {
      return 'Kamera ruxsati soʻralmoqda...';
    }
    
    if (isScanning && hasPermission) {
      return 'QR yoki shtrix-kodni ramkaga qaratib turing';
    }
    
    return 'Kamera tayyorlanmoqda...';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">
            📷 QR / Shtrix-kod Skaneri
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Yopish"
          >
            <i className="fa-solid fa-times text-xl text-gray-500"></i>
          </button>
        </div>

        {/* Scanner View - REMOVED BLUR AND BACKGROUND */}
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            autoPlay
          />
          
          {/* Scanning Overlay - TRANSPARENT FRAME ONLY */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-40">
              {/* Scanning Frame - TRANSPARENT, NO BLUR */}
              <div className="w-full h-full border-2 border-green-400 rounded-xl"></div>
              
              {/* Animated Scanning Line */}
              <div className="absolute left-2 right-2 top-0 h-1 bg-green-400 rounded-full shadow-[0_0_12px_rgba(74,222,128,0.9)] animate-scan-line"></div>
              
              {/* Corner Indicators */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-green-400 rounded-tl-lg"></div>
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-green-400 rounded-tr-lg"></div>
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-green-400 rounded-bl-lg"></div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-green-400 rounded-br-lg"></div>
            </div>
          </div>

          {/* Loading State */}
          {!hasPermission && !cameraError && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                <p className="text-lg font-medium">Kamera ochilmoqda...</p>
                <p className="text-sm text-gray-300 mt-1">Iltimos, kuting</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {cameraError && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
              <div className="text-center text-white max-w-sm">
                <i className="fa-solid fa-camera-slash text-5xl mb-4 text-red-400"></i>
                <p className="text-lg font-medium mb-3">{cameraError}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleRetry}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    🔄 Qayta urinish
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    ❌ Yopish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions & Status */}
        <div className="p-4 text-center bg-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isScanning && hasPermission && !cameraError && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Skanerlash faol</span>
              </div>
            )}
          </div>
          
          <p className={`font-medium ${
            cameraError ? 'text-red-600' : 
            isScanning && hasPermission ? 'text-gray-700' : 'text-gray-500'
          }`}>
            {getErrorMessage()}
          </p>
          
          {isScanning && hasPermission && !cameraError && (
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
              className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-rotate"></i>
              Qayta urinish
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-times"></i>
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;