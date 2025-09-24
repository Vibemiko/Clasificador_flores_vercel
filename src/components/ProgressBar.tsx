import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  color?: 'emerald' | 'amber' | 'blue' | 'red';
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className = '',
  showValue = true,
  color = 'emerald',
  label
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500'
  };

  const backgroundColorClasses = {
    emerald: 'bg-emerald-100',
    amber: 'bg-amber-100',
    blue: 'bg-blue-100',
    red: 'bg-red-100'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          {showValue && (
            <span className="text-sm font-semibold text-slate-900">
              {value.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full h-3 rounded-full ${backgroundColorClasses[color]} overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 0.8, 
            ease: [0.4, 0.0, 0.2, 1] 
          }}
        />
      </div>
    </div>
  );
};