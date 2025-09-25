import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower2, Upload, Camera, History, Zap, CircleAlert as AlertCircle, CircleCheck as CheckCircle2 } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { CameraCapture } from './components/CameraCapture';
import { PredictionResult } from './components/PredictionResult';
import { ResultsHistory } from './components/ResultsHistory';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useModel } from './hooks/useModel';
import type { PredictionResult as PredictionResultType } from './types';

type Tab = 'subir' | 'camara' | 'historial';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('subir');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResultType | null>(null);
  const [resultsHistory, setResultsHistory] = useState<PredictionResultType[]>([]);
  
  const { modelState, loadModel, predict } = useModel();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageProcess = async (imageUrl: string, source: 'subir' | 'camara') => {
    setIsProcessing(true);
    setCurrentImage(imageUrl);
    setCurrentPrediction(null);
    
    try {
      // Load model if not already loaded
      const model = await loadModel();
      if (!model) {
        throw new Error('Error al cargar el modelo');
      }

      // Wait a bit more for model to be fully ready
      await new Promise(resolve => setTimeout(resolve, 200));

      // Create image element for prediction
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = imageUrl;
      });

      // Ensure image is fully loaded and rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Make prediction
      const result = await predict(img);
      
      if (result) {
        const predictionResult: PredictionResultType = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          className: result.className,
          confidence: result.confidence,
          timestamp: new Date(),
          imageUrl,
          source
        };
        
        setCurrentPrediction(predictionResult);
        setResultsHistory(prev => [predictionResult, ...prev]);
      } else {
        throw new Error('Error en la predicción');
      }
    } catch (error) {
      console.error('Error de procesamiento:', error);
      // Handle error (could show toast or error message)
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (file: File, imageUrl: string) => {
    handleImageProcess(imageUrl, 'subir');
  };

  const handleCameraCapture = (imageUrl: string) => {
    handleImageProcess(imageUrl, 'camara');
  };

  const clearHistory = () => {
    setResultsHistory([]);
  };

  const tabs = [
    { id: 'subir' as const, label: 'Subir', icon: Upload },
    { id: 'camara' as const, label: 'Cámara', icon: Camera },
    { id: 'historial' as const, label: 'Historial', icon: History }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/50 to-slate-100">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <Flower2 className="h-8 w-8 text-emerald-600" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">FloraIA</h1>
                <p className="text-xs text-slate-500">Reconocimiento Inteligente de Flores</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-full">
                {modelState.isLoaded ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Modelo Listo</span>
                  </>
                ) : modelState.isLoading ? (
                  <>
                    <Zap className="h-4 w-4 text-amber-600 animate-pulse" />
                    <span className="text-sm font-medium text-amber-700">Cargando...</span>
                  </>
                ) : modelState.error ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">Error</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                    <span className="text-sm font-medium text-slate-600">Inactivo</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-slate-200">
            <div className="flex gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                      ${activeTab === tab.id 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                    {tab.id === 'historial' && resultsHistory.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        {resultsHistory.length > 99 ? '99+' : resultsHistory.length}
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'subir' && (
            <motion.div
              key="subir"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* Upload Section */}
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Subir Imagen</h2>
                  <ImageUploader
                    onImageSelect={handleImageUpload}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>

              {/* Result Section */}
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-slate-200"
                    >
                      <LoadingSpinner size="lg" text="Analizando flor..." />
                      {currentImage && (
                        <div className="mt-6">
                          <img
                            src={currentImage}
                            alt="Procesando"
                            className="w-full h-48 object-cover rounded-lg opacity-50"
                          />
                        </div>
                      )}
                    </motion.div>
                  ) : currentPrediction ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <PredictionResult result={currentPrediction} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-slate-200 text-center"
                    >
                      <div className="text-6xl mb-6">🌸</div>
                      <h3 className="text-xl font-semibold text-slate-700 mb-3">
                        Listo para identificar flores
                      </h3>
                      <p className="text-slate-500">
                        Subí una imagen para ver la identificación de flores con IA en acción.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === 'camara' && (
            <motion.div
              key="camara"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* Camera Section */}
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Captura con Cámara</h2>
                  <CameraCapture
                    onCapture={handleCameraCapture}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>

              {/* Result Section */}
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-slate-200"
                    >
                      <LoadingSpinner size="lg" text="Analizando foto capturada..." />
                      {currentImage && (
                        <div className="mt-6">
                          <img
                            src={currentImage}
                            alt="Procesando"
                            className="w-full h-48 object-cover rounded-lg opacity-50"
                          />
                        </div>
                      )}
                    </motion.div>
                  ) : currentPrediction && currentPrediction.source === 'camara' ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <PredictionResult result={currentPrediction} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-slate-200 text-center"
                    >
                      <div className="text-6xl mb-6">📸</div>
                      <h3 className="text-xl font-semibold text-slate-700 mb-3">
                        Cámara lista
                      </h3>
                      <p className="text-slate-500">
                        Capturá una foto para identificar flores al instante con la cámara de tu dispositivo.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === 'historial' && (
            <motion.div
              key="historial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResultsHistory
                results={resultsHistory}
                onClear={clearHistory}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;