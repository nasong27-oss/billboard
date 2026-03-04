'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ADDABLE_CHARTS, ChartConfig } from '@/lib/chartConfig';
import { useEffect } from 'react';

interface AddChartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentCharts: ChartConfig[];
  onAddChart: (chart: ChartConfig) => void;
}

export default function AddChartSheet({
  isOpen,
  onClose,
  currentCharts,
  onAddChart,
}: AddChartSheetProps) {
  const currentIds = new Set(currentCharts.map((c) => c.id));

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl
              bg-[#111111] border border-white/10 max-h-[80vh] overflow-y-auto
              pb-safe"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-4 pb-6">
              <h2 className="text-lg font-bold text-white mb-1">Add Chart</h2>
              <p className="text-sm text-gray-400 mb-4">Select a chart to add to your tabs</p>

              <div className="flex flex-col gap-2">
                {ADDABLE_CHARTS.map((chart) => {
                  const isAdded = currentIds.has(chart.id);
                  return (
                    <motion.button
                      key={chart.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (!isAdded) {
                          onAddChart(chart);
                          onClose();
                        }
                      }}
                      disabled={isAdded}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all
                        ${isAdded
                          ? 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 active:bg-white/15'
                        }`}
                    >
                      <span className="text-2xl">{chart.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{chart.label}</p>
                        <p className="text-xs text-gray-500">{chart.description}</p>
                      </div>
                      {isAdded && (
                        <span className="text-xs text-gray-500 font-medium">Added</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
