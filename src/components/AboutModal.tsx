import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, BookOpen } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-[#1b1a32] text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold">Acerca del Proyecto</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-br from-[#c4b6ee]/20 to-[#bdef34]/10 rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-[#bdef34] rounded-lg">
                      <BookOpen className="h-6 w-6 text-[#1b1a32]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1b1a32] mb-2">
                        Información Académica
                      </h3>
                    </div>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <p>
                      <span className="font-semibold text-[#1b1a32]">Materia:</span> Modelizado de Sistemas de IA
                    </p>
                    <p>
                      <span className="font-semibold text-[#1b1a32]">Grupo:</span> 2
                    </p>
                    <p>
                      <span className="font-semibold text-[#1b1a32]">Proyecto:</span> Modelo de clasificación convolucional para determinar tipos de flores (margarita o diente de león)
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#0bd17f]/10 to-[#c4b6ee]/10 rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-[#0bd17f] rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1b1a32] mb-2">
                        Integrantes del Equipo
                      </h3>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      'Sergio Pascuzzo',
                      'Lautaro Nuñez',
                      'Nadia T. D\'Angelo Batih',
                      'Miguel A. Tarifa'
                    ].map((name, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm"
                      >
                        <div className="w-2 h-2 bg-[#0bd17f] rounded-full" />
                        <span className="text-slate-700 font-medium">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-slate-500 text-center">
                    © 2025 florAI - Desarrollado con dedicación para el reconocimiento inteligente de flores
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
