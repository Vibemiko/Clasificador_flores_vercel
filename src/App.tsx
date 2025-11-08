import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, History, Zap, CircleAlert as AlertCircle, CircleCheck as CheckCircle2 } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { CameraCapture } from './components/CameraCapture';
import { PredictionResult } from './components/PredictionResult';
import { ResultsHistory } from './components/ResultsHistory';
import { LoadingSpinner } from './components/LoadingSpinner';
import { StartScreen } from './components/StartScreen';
import { DropdownMenu } from './components/DropdownMenu';
import { AboutModal } from './components/AboutModal';
import { useModel } from './hooks/useModel';
import type { PredictionResult as PredictionResultType } from './types';

type Tab = 'subir' | 'camara' | 'historial';

function App() {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);
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
      const model = await loadModel();
      if (!model) {
        throw new Error('Error al cargar el modelo');
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = imageUrl;
      });

      await new Promise(resolve => setTimeout(resolve, 100));

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

  if (showStartScreen) {
    return <StartScreen onStart={() => setShowStartScreen(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#c4b6ee]">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <header className="bg-[#1b1a32] border-b border-[#bdef34]/20 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <img
                src="/APP_logo_transparente.png"
                alt="florAI logo"
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Stinger, Georgia, serif' }}>
                  florAI
                </h1>
                <p className="text-xs text-[#bdef34]" style={{ fontFamily: 'Now, Arial, sans-serif' }}>
                  Reconoce con Inteligencia
                </p>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1b1a32]/50 border border-[#0bd17f]/30 rounded-full">
                {modelState.isLoaded ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-[#0bd17f]" />
                    <span className="text-sm font-medium text-[#0bd17f]" style={{ fontFamily: 'Now, Arial, sans-serif' }}>
                      Modelo Listo
                    </span>
                  </>
                ) : modelState.isLoading ? (
                  <>
                    <Zap className="h-4 w-4 text-[#bdef34] animate-pulse" />
                    <span className="text-sm font-medium text-[#bdef34]" style={{ fontFamily: 'Now, Arial, sans-serif' }}>
                      Cargando...
                    </span>
                  </>
                ) : modelState.error ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400" style={{ fontFamily: 'Now, Arial, sans-serif' }}>
                      Error
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400 rounded-full" />
                    <span className="text-sm font-medium text-slate-400" style={{ fontFamily: 'Now, Arial, sans-serif' }}>
                      Inactivo
                    </span>
                  </>
                )}
              </div>

              <DropdownMenu onAboutClick={() => setShowAboutModal(true)} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-[#bdef34]/20">
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
                        ? 'bg-[#0bd17f] text-white shadow-lg'
                        : 'text-[#1b1a32] hover:text-[#1b1a32] hover:bg-[#bdef34]/20'
                      }
                    `}
                    style={{ fontFamily: 'Now, Arial, sans-serif' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                    {tab.id === 'historial' && resultsHistory.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-[#bdef34] text-[#1b1a32] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
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
              <div className="space-y-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#bdef34]/20">
                  <h2 className="text-xl font-bold text-[#1b1a32] mb-4" style={{ fontFamily: 'Stinger, Georgia, serif' }}>
                    Subir Imagen
                  </h2>
                  <ImageUploader
                    onImageSelect={handleImageUpload}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-[#bdef34]/20"
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
                      className="bg-white/90 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-[#bdef34]/20 text-center"
                    >
                      <img
                        src="/subir_imagen_transparente.png"
                        alt="Listo para identificar flores"
                        className="w-48 h-48 mx-auto mb-6 object-contain"
                      />
                      <h3 className="text-xl font-semibold text-[#1b1a32] mb-3" style={{ fontFamily: 'Stinger, Georgia, serif' }}>
                        Listo para identificar flores
                      </h3>
                      <p className="text-slate-600" style={{ fontFamily: 'Now, Arial, sans-serif' }}>
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
              <div className="space-y-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#bdef34]/20">
                  <h2 className="text-xl font-bold text-[#1b1a32] mb-4" style={{ fontFamily: 'Stinger, Georgia, serif' }}>
                    Captura con Cámara
                  </h2>
                  <CameraCapture
                    onCapture={handleCameraCapture}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-[#bdef34]/20"
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
                      className="bg-white/90 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-[#bdef34]/20 text-center"
                    >
                      <img
                        src="/Escanear_imagen_transparente.png"
                        alt="Cámara lista"
                        className="w-48 h-48 mx-auto mb-6 object-contain"
                      />
                      <h3 className="text-xl font-semibold text-[#1b1a32] mb-3" style={{ fontFamily: 'Stinger, Georgia, serif' }}>
                        Cámara lista
                      </h3>
                      <p className="text-slate-600" style={{ fontFamily: 'Now, Arial, sans-serif' }}>
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

      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
    </div>
  );
}

export default App;
