import React from 'react';
import { motion } from 'framer-motion';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#c4b6ee] flex items-center justify-center cursor-pointer"
      onClick={onStart}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <img
          src="/starting_screen_transparente.png"
          alt="florAI - Iniciar aplicación"
          className="max-w-[90%] max-h-[90vh] object-contain"
        />

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 text-center w-full"
        >
          <p className="text-[#1b1a32] text-lg font-semibold">
            Toca para comenzar
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
