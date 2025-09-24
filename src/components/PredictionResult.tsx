import React from 'react';
import { motion } from 'framer-motion';
import { Flower, Clock, CheckCircle2, Share2, Download } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import type { PredictionResult as PredictionResultType } from '../types';

interface PredictionResultProps {
  result: PredictionResultType;
  onShare?: () => void;
  onDownload?: () => void;
  className?: string;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({
  result,
  onShare,
  onDownload,
  className = ''
}) => {
  const getFlowerEmoji = (className: string) => {
    return className.toLowerCase().includes('daisy') ? '🌼' : '🌻';
  };

  const getConfidenceColor = (confidence: number): 'emerald' | 'amber' | 'red' => {
    if (confidence >= 80) return 'emerald';
    if (confidence >= 60) return 'amber';
    return 'red';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
      className={`bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden ${className}`}
    >
      <div className="relative">
        <img
          src={result.imageUrl}
          alt={`Identified ${result.className}`}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-emerald-500 text-white p-2 rounded-full shadow-lg"
          >
            <CheckCircle2 className="h-5 w-5" />
          </motion.div>
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-white text-sm font-medium">
              {result.source === 'webcam' ? 'Camera' : 'Upload'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="text-4xl"
          >
            {getFlowerEmoji(result.className)}
          </motion.div>
          
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">
              {result.className}
            </h3>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              <span>{result.timestamp.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <ProgressBar
            value={result.confidence}
            label="Confidence Score"
            color={getConfidenceColor(result.confidence)}
          />
          
          <div className="flex items-center justify-center gap-2 text-sm">
            <Flower className="h-4 w-4 text-emerald-600" />
            <span className="text-slate-600 font-medium">
              {result.confidence >= 80 ? 'High confidence' : 
               result.confidence >= 60 ? 'Medium confidence' : 'Low confidence'}
            </span>
          </div>
        </div>

        {(onShare || onDownload) && (
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            {onShare && (
              <motion.button
                onClick={onShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 className="h-4 w-4" />
                Share
              </motion.button>
            )}
            
            {onDownload && (
              <motion.button
                onClick={onDownload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="h-4 w-4" />
                Download
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};