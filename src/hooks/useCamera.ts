import { useState, useCallback, useRef, useEffect } from 'react';
import type { CameraState } from '../types';

export const useCamera = () => {
  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    isSupported: true,
    error: null,
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraState(prev => ({ ...prev, error: null }));
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays automatically
        videoRef.current.play().catch(console.error);
        streamRef.current = stream;
        setCameraState({
          isActive: true,
          isSupported: true,
          error: null,
        });
      }
    } catch (error) {
      console.error('Camera access error:', error);
      
      let errorMessage = 'Camera access failed';
      
      if (error instanceof Error) {
        // Check for specific permission denied error
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please enable camera access in your browser settings and refresh the page.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setCameraState({
        isActive: false,
        isSupported: true,
        error: errorMessage,
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraState(prev => ({ ...prev, isActive: false }));
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !cameraState.isActive) return null;
    
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [cameraState.isActive]);

  useEffect(() => {
    const checkSupport = () => {
      const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      if (!isSupported) {
        setCameraState(prev => ({ 
          ...prev, 
          isSupported: false, 
          error: 'Camera not supported in this browser' 
        }));
      }
    };
    
    checkSupport();
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    cameraState,
    videoRef,
    startCamera,
    stopCamera,
    captureFrame,
  };
};