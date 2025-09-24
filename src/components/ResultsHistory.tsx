import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Filter, Calendar, Flower2, Trash2, Search } from 'lucide-react';
import { PredictionResult } from './PredictionResult';
import type { PredictionResult as PredictionResultType } from '../types';

interface ResultsHistoryProps {
  results: PredictionResultType[];
  onClear?: () => void;
  className?: string;
}

export const ResultsHistory: React.FC<ResultsHistoryProps> = ({
  results,
  onClear,
  className = ''
}) => {
  const [filter, setFilter] = useState<'all' | 'daisy' | 'dandelion'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'confidence'>('newest');

  const filteredResults = results
    .filter(result => {
      if (filter === 'all') return true;
      return result.className.toLowerCase().includes(filter);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return b.timestamp.getTime() - a.timestamp.getTime();
      }
      return b.confidence - a.confidence;
    });

  const stats = {
    total: results.length,
    daisies: results.filter(r => r.className.toLowerCase().includes('daisy')).length,
    dandelions: results.filter(r => r.className.toLowerCase().includes('dandelion')).length,
    avgConfidence: results.length > 0 
      ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length 
      : 0
  };

  if (results.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <History className="mx-auto h-16 w-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">No results yet</h3>
        <p className="text-slate-500">
          Upload an image or use your camera to start identifying flowers!
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with stats */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">Results History</h2>
          </div>
          
          {onClear && results.length > 0 && (
            <motion.button
              onClick={onClear}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </motion.button>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Scans</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-800">{stats.daisies}</div>
            <div className="text-sm text-yellow-600">🌼 Daisies</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-800">{stats.dandelions}</div>
            <div className="text-sm text-orange-600">🌻 Dandelions</div>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-800">
              {stats.avgConfidence.toFixed(0)}%
            </div>
            <div className="text-sm text-emerald-600">Avg. Confidence</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filter:</span>
          </div>
          
          <div className="flex gap-2">
            {(['all', 'daisy', 'dandelion'] as const).map((filterOption) => (
              <motion.button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === filterOption
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filterOption === 'all' ? 'All' : filterOption}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Calendar className="h-4 w-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'confidence')}
              className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="confidence">Highest Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results grid */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          layout
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredResults.map((result) => (
            <motion.div
              key={result.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <PredictionResult
                result={result}
                onShare={() => {
                  // Implement sharing functionality
                  if (navigator.share) {
                    navigator.share({
                      title: `Identified: ${result.className}`,
                      text: `I identified a ${result.className} with ${result.confidence.toFixed(1)}% confidence!`,
                      url: window.location.href,
                    });
                  }
                }}
                onDownload={() => {
                  // Implement download functionality
                  const link = document.createElement('a');
                  link.href = result.imageUrl;
                  link.download = `${result.className}-${result.timestamp.toISOString()}.jpg`;
                  link.click();
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredResults.length === 0 && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Search className="mx-auto h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No matching results</h3>
          <p className="text-slate-500">
            Try adjusting your filters to see more results.
          </p>
        </motion.div>
      )}
    </div>
  );
};