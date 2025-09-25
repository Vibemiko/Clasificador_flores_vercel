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
  const stateCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Direct DOM state checker - bypasses React state issues
  const checkVideoState = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const hasStream = video.srcObject !== null;
    const isPlaying = !video.paused && !video.ended && video.readyState > 2;
    const hasVideoTrack = streamRef.current?.getVideoTracks().some(track => track.readyState === 'live') || false;

    console.log('Video state check:', {
      hasStream,
      isPlaying,
      hasVideoTrack,
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight
    });

    // Update state based on actual DOM state
    setCameraState(prev => ({
      ...prev,
      isActive: hasStream && hasVideoTrack && (isPlaying || video.readyState >= 3)
    }));
  }, []);

  const startCamera = useCallback(async () => {
    try {
      console.log('Starting camera...');
      setCameraState(prev => ({ ...prev, error: null }));
      
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request camera access with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      });
      
      console.log('Camera stream obtained:', stream.getVideoTracks().length, 'video tracks');
      streamRef.current = stream;
      
      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element not found');
      }

      // Direct DOM manipulation - set srcObject immediately
      video.srcObject = stream;
      
      // Force video properties
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;

      // Multiple attempts to start video playback
      const attemptPlay = async (attempt = 1, maxAttempts = 5) => {
        try {
          console.log(`Play attempt ${attempt}/${maxAttempts}`);
          await video.play();
          console.log('Video playing successfully');
          
          // Start state checking interval
          if (stateCheckIntervalRef.current) {
            clearInterval(stateCheckIntervalRef.current);
          }
          stateCheckIntervalRef.current = setInterval(checkVideoState, 500);
          
        } catch (playError) {
          console.error(`Play attempt ${attempt} failed:`, playError);
          
          if (attempt < maxAttempts) {
            // Wait and retry
            setTimeout(() => attemptPlay(attempt + 1, maxAttempts), 200 * attempt);
          } else {
            // Final attempt failed - but stream might still work
            console.warn('All play attempts failed, but stream may still be active');
            checkVideoState(); // Check state anyway
          }
        }
      };

      // Wait for metadata and then attempt play
      const onLoadedMetadata = () => {
        console.log('Video metadata loaded:', {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          duration: video.duration
        });
        attemptPlay();
      };

      const onCanPlay = () => {
        console.log('Video can play');
        checkVideoState();
      };

      const onError = (e: Event) => {
        console.error('Video error:', e);
        setCameraState(prev => ({ 
          ...prev, 
          isActive: false, 
          error: 'Video playback error' 
        }));
      };

      // Add event listeners
      video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onError);
      video.addEventListener('playing', () => {
        console.log('Video playing event fired');
        checkVideoState();
      });

      // Cleanup function for event listeners
      const cleanup = () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
      };

      // Store cleanup function
      (video as any)._cameraCleanup = cleanup;

      // Immediate state check after a short delay
      setTimeout(checkVideoState, 1000);
      
    } catch (error) {
      console.error('Camera access error:', error);
      
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
    }
  }, [checkVideoState]);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...');
    
    // Clear state check interval
    if (stateCheckIntervalRef.current) {
      clearInterval(stateCheckIntervalRef.current);
      stateCheckIntervalRef.current = null;
    }
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.label);
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Clean up video element
    const video = videoRef.current;
    if (video) {
      // Call cleanup function if it exists
      if ((video as any)._cameraCleanup) {
        (video as any)._cameraCleanup();
        delete (video as any)._cameraCleanup;
      }
      
      video.srcObject = null;
      video.load(); // Reset video element
    }
    
    setCameraState(prev => ({ ...prev, isActive: false }));
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !cameraState.isActive || video.readyState < 2) {
      console.warn('Cannot capture: video not ready', {
        hasVideo: !!video,
        isActive: cameraState.isActive,
        readyState: video?.readyState
      });
      return null;
    }
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Cannot get canvas context');
        return null;
      }
      
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Frame captured successfully');
      return dataUrl;
    } catch (error) {
      console.error('Capture error:', error);
      return null;
    }
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
      // Cleanup on unmount
      if (stateCheckIntervalRef.current) {
        clearInterval(stateCheckIntervalRef.current);
      }
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