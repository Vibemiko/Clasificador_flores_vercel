import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Aperture as Capture, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { LoadingSpinner } from './LoadingSpinner';

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
  isProcessing?: boolean;
  className?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  isProcessing = false,
  className = ''
}) => {
  const { cameraState, videoRef, startCamera, stopCamera, captureFrame } = useCamera();
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Debug information updater
  useEffect(() => {
    const updateDebugInfo = () => {
      const video = videoRef.current;
      if (video) {
        setDebugInfo({
          hasStream: !!video.srcObject,
          readyState: video.readyState,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          paused: video.paused,
          ended: video.ended,
          currentTime: video.currentTime
        });
      }
    };

    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [videoRef]);

  const handleCapture = () => {
    const imageUrl = captureFrame();
    if (imageUrl) {
      onCapture(imageUrl);
    } else {
      console.error('Failed to capture frame');
    }
  };

  const handleRetry = () => {
    stopCamera();
    setTimeout(startCamera, 500);
  };

  if (!cameraState.isSupported) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
        <p className="text-lg font-medium text-slate-700 mb-2">Camera not supported</p>
        <p className="text-sm text-slate-500">
          Your browser or device doesn't support camera access.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          {!cameraState.isActive ? (
            <motion.div
              key="camera-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="aspect-video flex flex-col items-center justify-center p-8 text-center"
            >
              <CameraOff className="h-20 w-20 text-slate-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Camera is off
              </h3>
              <p className="text-slate-300 mb-6">
                Start your camera to capture flower images for identification
              </p>
              
              {cameraState.error ? (
                <div className="space-y-4 w-full max-w-md">
                  <div className="p-4 bg-red-900/50 border border-red-700/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-200">Camera Error</p>
                        <p className="text-sm text-red-300 mt-1">{cameraState.error}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleRetry}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </motion.button>
                    
                    <motion.button
                      onClick={startCamera}
                      className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Camera className="h-4 w-4" />
                      Start Camera
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={startCamera}
                  className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-medium shadow-lg transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Camera className="h-5 w-5" />
                  Start Camera
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="camera-on"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-video object-cover bg-slate-800"
                style={{ minHeight: '300px' }}
              />
              
              {/* Camera overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/20 rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400"></div>
                </div>
              </div>

              {/* Status indicator */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2 bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Camera Active
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {cameraState.isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4"
        >
          <motion.button
            onClick={handleCapture}
            disabled={isProcessing}
            className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            whileHover={!isProcessing ? { scale: 1.05 } : {}}
            whileTap={!isProcessing ? { scale: 0.95 } : {}}
          >
            <Capture className="h-5 w-5" />
            {isProcessing ? 'Processing...' : 'Capture Photo'}
          </motion.button>
          
          <motion.button
            onClick={stopCamera}
            className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CameraOff className="h-4 w-4" />
            Stop
          </motion.button>
        </motion.div>
      )}

      {/* Debug information (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs">
          <strong>Debug Info:</strong>
          <pre>{JSON.stringify({ cameraState, debugInfo }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};