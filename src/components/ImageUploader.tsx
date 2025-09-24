import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File, imageUrl: string) => void;
  isProcessing?: boolean;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  isProcessing = false,
  className = ''
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onImageSelect(file, imageUrl);
    }
  }, [onImageSelect]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isProcessing
  });

  const hasErrors = fileRejections.length > 0;

  return (
    <div className={className}>
      <motion.div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject ? 'border-emerald-400 bg-emerald-50' : ''}
          ${isDragReject || hasErrors ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'}
          ${!isDragActive && !hasErrors ? 'hover:border-emerald-400 hover:bg-emerald-50' : ''}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        whileHover={!isProcessing ? { scale: 1.01 } : {}}
        whileTap={!isProcessing ? { scale: 0.99 } : {}}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {isDragActive ? (
            <motion.div
              key="drag-active"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Upload className="mx-auto h-16 w-16 text-emerald-500" />
              </motion.div>
              <p className="text-lg font-medium text-emerald-700">
                {isDragReject ? 'File type not supported' : 'Drop your image here'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="drag-inactive"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <div className="relative">
                  <ImageIcon className="h-16 w-16 text-slate-400" />
                  <motion.div
                    className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-2"
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Upload className="h-4 w-4 text-white" />
                  </motion.div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-semibold text-slate-700">
                  Upload a flower image
                </p>
                <p className="text-sm text-slate-500">
                  Drag and drop or click to select
                </p>
                <p className="text-xs text-slate-400">
                  Supports JPEG, PNG, GIF, WebP (max 10MB)
                </p>
              </div>
              
              <motion.button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isProcessing}
              >
                <ImageIcon className="h-5 w-5" />
                Choose Image
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-800">Upload failed</p>
                {fileRejections.map(({ file, errors }) => (
                  <div key={file.name} className="text-sm text-red-600">
                    <span className="font-medium">{file.name}:</span>
                    <ul className="mt-1 list-disc list-inside">
                      {errors.map(error => (
                        <li key={error.code}>{error.message}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};