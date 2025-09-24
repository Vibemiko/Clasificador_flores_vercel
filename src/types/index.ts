export interface PredictionResult {
  id: string;
  className: string;
  confidence: number;
  timestamp: Date;
  imageUrl: string;
  source: 'upload' | 'webcam';
}

export interface ModelState {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
}

export interface CameraState {
  isActive: boolean;
  isSupported: boolean;
  error: string | null;
}