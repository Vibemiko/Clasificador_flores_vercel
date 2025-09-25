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
  const isStartingRef = useRef(false);

  const startCamera = useCallback(async () => {
    if (isStartingRef.current) {
      console.log('Camera start already in progress');
      return;
    }

    isStartingRef.current = true;
    console.log('🎥 Starting camera with direct DOM approach...');
    
    try {
      setCameraState(prev => ({ ...prev, error: null }));
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Get video element
      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element not available');
      }

      console.log('📹 Requesting camera access...');
      
      // Request camera with optimal settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      });
      
      console.log('✅ Camera stream obtained:', {
        tracks: stream.getVideoTracks().length,
        settings: stream.getVideoTracks()[0]?.getSettings()
      });
      
      streamRef.current = stream;

      // DIRECT DOM MANIPULATION - Set properties immediately
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      
      // Force immediate state update - don't wait for events
      setCameraState({
        isActive: true,
        isSupported: true,
        error: null,
      });

      console.log('🎬 Video element configured, attempting play...');

      // Attempt to play with aggressive retry
      let playAttempts = 0;
      const maxAttempts = 5;
      
      const attemptPlay = async (): Promise<void> => {
        playAttempts++;
        console.log(`▶️ Play attempt ${playAttempts}/${maxAttempts}`);
        
        try {
          await video.play();
          console.log('🎉 Video playing successfully!');
        } catch (playError) {
          console.warn(`❌ Play attempt ${playAttempts} failed:`, playError);
          
          if (playAttempts < maxAttempts) {
            // Wait progressively longer between attempts
            await new Promise(resolve => setTimeout(resolve, 100 * playAttempts));
            return attemptPlay();
          } else {
            console.warn('⚠️ All play attempts failed, but stream should still be active');
            // Don't throw error - the stream is still valid even if play() fails
          }
        }
      };

      // Start play attempts
      await attemptPlay();

      console.log('✨ Camera setup complete');
      
    } catch (error) {
      console.error('💥 Camera setup failed:', error);
      
      let errorMessage = 'Camera access failed';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please enable camera access in your browser settings and refresh the page.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setCameraState({
        isActive: false,
        isSupported: true,
        error: errorMessage,
      });
    } finally {
      isStartingRef.current = false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera...');
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('🔇 Stopping track:', track.kind, track.label);
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Clean up video element
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
      video.load();
    }
    
    setCameraState(prev => ({ ...prev, isActive: false }));
    console.log('✅ Camera stopped');
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !streamRef.current) {
      console.warn('❌ Cannot capture: video or stream not available');
      return null;
    }
    
    // Check if video has dimensions (indicates it's actually playing)
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('❌ Cannot capture: video has no dimensions');
      return null;
    }
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Cannot get canvas context');
        return null;
      }
      
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      console.log('📸 Frame captured successfully');
      return dataUrl;
    } catch (error) {
      console.error('💥 Capture error:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const checkSupport = () => {
      const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      if (!isSupported) {
        setCameraState(prev => ({ 
          ...prev, 
          isSupported: false, 
          error: 'Cámara no soportada en este navegador' 
        }));
      }
    };
    
    checkSupport();
  }, []);

  useEffect(() => {
    return () => {
      console.log('🧹 Limpiando hook de cámara');
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