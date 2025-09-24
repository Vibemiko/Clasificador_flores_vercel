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

  const loadModel = useCallback(async () => {
    if (model) return model;
    
    setModelState({ isLoading: true, isLoaded: false, error: null });
    
    try {
      console.log('Loading TensorFlow.js model...');
      const loadedModel = await tf.loadGraphModel(MODEL_URL);
      
      // Warm up the model with a dummy prediction
      const dummyInput = tf.zeros([1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3]);
      await loadedModel.predict(dummyInput);
      dummyInput.dispose();
      
      setModel(loadedModel);
      setModelState({ isLoading: false, isLoaded: true, error: null });
      console.log('Model loaded successfully');
      
      return loadedModel;
    } catch (error) {
      console.error('Error loading model:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setModelState({ isLoading: false, isLoaded: false, error: errorMessage });
      return null;
    }
  }, [model]);

  const predict = useCallback(async (imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<{ className: string; confidence: number } | null> => {
    if (!model) {
      console.warn('Model not loaded');
      return null;
    }

    try {
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
          className: 'Daisy',
          confidence: (1 - confidence) * 100
        };
      } else {
        return {
          className: 'Dandelion',
          confidence: confidence * 100
        };
      }
    } catch (error) {
      console.error('Prediction error:', error);
      return null;
    }
  }, [model]);

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
  };
};