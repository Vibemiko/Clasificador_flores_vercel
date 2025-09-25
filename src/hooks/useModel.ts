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
      console.log('Cargando modelo TensorFlow.js...');
      const loadedModel = await tf.loadGraphModel(MODEL_URL);
      
          errorMessage = 'Permiso de cámara denegado. Por favor habilitá el acceso a la cámara en la configuración de tu navegador y refrescá la página.';
      console.log('Calentando modelo...');
          errorMessage = 'No se encontró cámara. Por favor conectá una cámara y probá de nuevo.';
        const dummyInput = tf.zeros([1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3]);
          errorMessage = 'La cámara ya está siendo usada por otra aplicación.';
        await warmupPrediction.data(); // Force execution
        dummyInput.dispose();
        warmupPrediction.dispose();
      }
      
      setIsWarmedUp(true);
      
      setModel(loadedModel);
      setModelState({ isLoading: false, isLoaded: true, error: null });
      console.log('Modelo cargado y calentado exitosamente');
      
      return loadedModel;
    } catch (error) {
      console.error('Error cargando modelo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setModelState({ isLoading: false, isLoaded: false, error: errorMessage });
      setIsWarmedUp(false);
      return null;
    }
  }, [model]);

  const predict = useCallback(async (imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<{ className: string; confidence: number } | null> => {
    if (!model || !isWarmedUp) {
      console.warn('Modelo no cargado o no calentado');
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
      console.error('Error de predicción:', error);
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