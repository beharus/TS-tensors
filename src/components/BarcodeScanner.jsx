// components/BarcodeScanner.jsx
import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

const BarcodeScanner = ({ isOpen, onClose, onBarcodeDetected, onError }) => {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const streamRef = useRef(null); // 🔥 NEW: Track the camera stream
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);
  const [showPermissionScreen, setShowPermissionScreen] = useState(true);
  const [scannerStarted, setScannerStarted] = useState(false);

  // Initialize codeReader once
  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    return () => {
      stopScanner();
      codeReader.current = null;
    };
  }, []);

  // Start/stop scanner based on modal state and permission
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }
    if (permissionAsked && hasPermission && !scannerStarted) {
      startScanner();
    }
  }, [isOpen, permissionAsked, hasPermission]);

  // Request camera permission
  const askBrowserPermission = async () => {
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
      
      // Stop immediately - we just needed permission
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

      setPermissionAsked(true);
      setHasPermission(true);
      setShowPermissionScreen(false);

    } catch (err) {
      console.error("Permission denied or error:", err);
      setPermissionAsked(true);
      setHasPermission(false);
      setCameraError(
        "Kameraga ruxsat berilmadi. Iltimos, brauzer sozlamalaridan ruxsat bering."
      );
      onError?.(err);
    }
  };

  // Start ZXing scanner
  const startScanner = async () => {
    if (scannerStarted || !isOpen || !hasPermission) return;

    try {
      setScannerStarted(true);
      setCameraError(null);
      setIsScanning(true);

      console.log('🎯 Starting ZXing scanner...');

      // Get the actual stream for scanning
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      // Set up video element with the stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current.readyState >= 4) {
            resolve();
          } else {
            videoRef.current.onloadedmetadata = resolve;
          }
        });
      }

      // Start ZXing decoding
      codeReader.current.decodeFromVideoDevice(
        null, // Let ZXing choose the camera automatically
        videoRef.current,
        (result, err) => {
          if (result) {
            console.log('🎉 Barcode detected:', result.getText());
            handleSuccessfulScan(result.getText());
          } else if (err && !(err instanceof NotFoundException)) {
            console.warn("Scanning error:", err);
            onError?.(err);
          }
        }
      );

      console.log('✅ Scanner started successfully!');

    } catch (err) {
      console.error("Scanner failed:", err);
      setScannerStarted(false);
      setIsScanning(false);
      handleScannerError(err);
    }
  };

  // Handle successful scan
  const handleSuccessfulScan = (barcode) => {
    console.log('✅ Scan successful, stopping scanner...');
    stopScanner();
    onBarcodeDetected(barcode);
  };

  // Handle scanner errors
  const handleScannerError = (error) => {
    if (!error) return;

    console.error('Scanner error:', error);

    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      setCameraError(
        "Kameraga ruxsat berilmadi. Iltimos, brauzer sozlamalaridan ruxsat bering."
      );
    } else if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
      setCameraError("Kamera topilmadi yoki sozlamalar mos kelmadi.");
    } else {
      setCameraError("Kamerani ishga tushirib bo'lmadi: " + error.message);
    }

    onError?.(error);
    setIsScanning(false);
    setScannerStarted(false);
  };

  // Stop scanner and camera
  const stopScanner = () => {
    console.log('🛑 Stopping scanner...');
    
    try {
      codeReader.current?.reset();
    } catch (e) {
      console.warn("Error resetting scanner:", e);
    }

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
    setScannerStarted(false);
    setCameraError(null);
  };

  const handleRetry = async () => {
    console.log('🔄 Retrying scanner...');
    stopScanner();
    if (!hasPermission) {
      setShowPermissionScreen(true);
      setCameraError(null);
    } else {
      await new Promise((res) => setTimeout(res, 500));
      startScanner();
    }
  };

  const openCameraSettings = () => {
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      alert(
        "Safari sozlamalariga o'ting: Sozlamalar > Safari > Kamera > Ushbu saytga ruxsat bering"
      );
    } else {
      alert("Brauzer sozlamalariga o'ting: Site settings > Camera > Allow");
    }
  };

  const handleClose = () => {
    console.log('🚪 Closing scanner...');
    stopScanner();
    setShowPermissionScreen(true);
    setPermissionAsked(false);
    setHasPermission(false);
    setScannerStarted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
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

        {/* Permission Screen */}
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
                QR kod va shtrix-kodlarni skaner qilish uchun kamerangizdan
                foydalanishimizga ruxsat bering.
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

        {/* Scanner Screen */}
        {!showPermissionScreen && hasPermission && (
          <>
            <div className="relative bg-black aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                autoPlay
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-green-400 rounded-lg w-64 h-40 relative">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-green-400"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-green-400"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-green-400"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-green-400"></div>
                </div>
              </div>

              {cameraError && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
                  <div className="text-center text-white">
                    <i className="fa-solid fa-triangle-exclamation text-3xl mb-3 text-red-400"></i>
                    <p className="text-sm mb-3">{cameraError}</p>
                    <button
                      onClick={handleRetry}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Qayta urinish
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 text-center bg-white">
              <p className="font-medium text-gray-700">
                QR yoki shtrix-kodni ramkaga qaratib turing
              </p>
              {isScanning && !cameraError && (
                <p className="text-sm text-green-600 mt-1">
                  🔍 Skanerlash faol...
                </p>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
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
          </>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;