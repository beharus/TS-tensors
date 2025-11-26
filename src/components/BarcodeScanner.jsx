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

  // 🔥 STEP 1: Request camera permission FIRST (this triggers the popup)
  const requestCameraPermission = async () => {
    try {
      console.log('📸 Requesting camera permission...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // Store the stream for later use
      streamRef.current = stream;
      setHasPermission(true);
      
      console.log('✅ Camera permission granted!');
      return true;
      
    } catch (err) {
      console.error('❌ Camera permission rejected:', err);
      
      if (err.name === 'NotAllowedError') {
        setCameraError("Kamera ruxsat berilmadi. Ilova uchun ruxsatni yoqing.");
      } else if (err.name === 'NotFoundError') {
        setCameraError("Kamera topilmadi. Qurilmangizda kamera mavjud emas.");
      } else {
        setCameraError("Kamerani ishga tushirib bo'lmadi.");
      }
      
      return false;
    }
  };

  const startScanner = async () => {
    if (!isOpen) return;

    try {
      setCameraError(null);
      setIsScanning(true);
      setHasPermission(false);

      console.log('🔄 Starting scanner...');

      // 🔥 STEP 2: Request permission FIRST - this triggers the browser popup
      const permissionGranted = await requestCameraPermission();
      if (!permissionGranted) {
        setIsScanning(false);
        return;
      }

      // 🔥 STEP 3: Set up video with the granted stream
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.setAttribute('playsinline', 'true');
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

      // 🔥 STEP 4: Get available cameras and start ZXing
      const devices = await codeReader.current.listVideoInputDevices();
      console.log('📷 Available cameras:', devices);

      if (devices.length === 0) {
        throw new Error('No camera found');
      }

      // Select back camera if available
      const backCam = devices.find(d =>
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('environment')
      );
      
      const selectedDeviceId = backCam ? backCam.deviceId : devices[0].deviceId;
      console.log('🎯 Selected camera:', backCam?.label || devices[0].label);

      // 🔥 STEP 5: Start ZXing decoding
      codeReader.current.decodeFromVideoDevice(
        selectedDeviceId,
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
      console.error('❌ Scanner initialization failed:', error);
      setCameraError('Kamerani ishga tushirib bo‘lmadi');
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
    await new Promise(resolve => setTimeout(resolve, 500));
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
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
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

        {/* Scanner View */}
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            autoPlay
            allow="camera"
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
                <p className="text-lg font-medium">Kamera ruxsati so'ralmoqda...</p>
                <p className="text-sm text-gray-300 mt-1">Iltimos, kuting</p>
              </div>
            </div>
          )}

          {/* Permission Request State */}
          {!hasPermission && !cameraError && isScanning && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center text-white max-w-sm">
                <i className="fa-solid fa-camera text-5xl mb-4 text-green-400"></i>
                <p className="text-lg font-medium mb-2">Kamera ruxsati kerak</p>
                <p className="text-sm text-gray-300">
                  Iltimos, brauzerning kamera ruxsatini qabul qiling
                </p>
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

          <p className={`font-medium ${cameraError ? 'text-red-600' :
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