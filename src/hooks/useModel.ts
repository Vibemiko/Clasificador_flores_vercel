import { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import type { ModelState } from '../types';

const MODEL_URL = '/models/model.json';
const MODEL_INPUT_SIZE = 192;

export const useModel = () => {
  const [modelState, setModelState] = useState<ModelState>({
    isLoading: false,
    isLoaded: false,
    error: null,
  });
  
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [isWarmedUp, setIsWarmedUp] = useState(false);

  const loadModel = useCallback(async () => {
    if (model) return model;
    
    setModelState({ isLoading: true, isLoaded: false, error: null });
    
    try {
      console.log('Loading TensorFlow.js model...');
      const loadedModel = await tf.loadGraphModel(MODEL_URL);
      
      // Warm up the model with multiple dummy predictions to ensure stability
      console.log('Warming up model...');
      for (let i = 0; i < 3; i++) {
        const dummyInput = tf.zeros([1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3]);
        const warmupPrediction = loadedModel.predict(dummyInput) as tf.Tensor;
        await warmupPrediction.data(); // Force execution
        dummyInput.dispose();
        warmupPrediction.dispose();
      }
      
      setIsWarmedUp(true);
      
      setModel(loadedModel);
      setModelState({ isLoading: false, isLoaded: true, error: null });
      console.log('Model loaded and warmed up successfully');
      
      return loadedModel;
    } catch (error) {
      console.error('Error loading model:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setModelState({ isLoading: false, isLoaded: false, error: errorMessage });
      setIsWarmedUp(false);
      return null;
    }
  }, [model]);

  const predict = useCallback(async (imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<{ className: string; confidence: number } | null> => {
    if (!model || !isWarmedUp) {
      console.warn('Model not loaded or not warmed up');
      return null;
    }

    try {
      // Add a small delay to ensure the image is fully loaded
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const predictions = tf.tidy(() => {
        const imageTensor = tf.browser.fromPixels(imageElement, 3);
        const resized = tf.image.resizeBilinear(imageTensor, [MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
        const normalized = resized.div(255.0);
        const batched = normalized.expandDims(0);
        return model.predict(batched) as tf.Tensor;
      });

      const predictionData = await predictions.data();
      predictions.dispose();

      const confidence = predictionData[0];
      
      if (confidence < 0.5) {
        return {
          className: 'Margarita',
          confidence: (1 - confidence) * 100
        };
      } else {
        return {
          className: 'Diente de Leon',
          confidence: confidence * 100
        };
      }
    } catch (error) {
      console.error('Prediction error:', error);
      return null;
    }
  }, [model, isWarmedUp]);

  // Auto-load model on hook initialization
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  useEffect(() => {
    return () => {
      if (model) {
        model.dispose();
      }
    };
  }, [model]);

  return {
    modelState,
    loadModel,
    predict,
    isWarmedUp,
  };
};