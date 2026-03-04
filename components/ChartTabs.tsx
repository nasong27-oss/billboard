'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartConfig, DEFAULT_CHARTS, ADDABLE_CHARTS } from '@/lib/chartConfig';
import ChartList from './ChartList';
import AddChartSheet from './AddChartSheet';

const STORAGE_KEY = 'billboard_extra_charts';

function loadExtraCharts(): ChartConfig[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const ids: string[] = JSON.parse(raw);
    return ids
      .map((id) => ADDABLE_CHARTS.find((c) => c.id === id))
      .filter(Boolean) as ChartConfig[];
  } catch {
    return [];
  }
}

function saveExtraCharts(charts: ChartConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(charts.map((c) => c.id)));
}

export default function ChartTabs() {
  const [extraCharts, setExtraCharts] = useState<ChartConfig[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showSheet, setShowSheet] = useState(false);
  const [longPressId, setLongPressId] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [direction, setDirection] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setExtraCharts(loadExtraCharts());
    setMounted(true);
  }, []);

  const allCharts = [...DEFAULT_CHARTS, ...extraCharts];
  const activeChart = allCharts[activeTab] || allCharts[0];

  const handleTabClick = (index: number) => {
    setDirection(index > activeTab ? 1 : -1);
    setActiveTab(index);
    // Scroll tab into view
    const tab = tabsRef.current?.children[index] as HTMLElement;
    tab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const handleAddChart = (chart: ChartConfig) => {
    const updated = [...extraCharts, chart];
    setExtraCharts(updated);
    saveExtraCharts(updated);
    setActiveTab(allCharts.length); // switch to new tab
  };

  const handleRemoveChart = (chartId: string) => {
    const updated = extraCharts.filter((c) => c.id !== chartId);
    setExtraCharts(updated);
    saveExtraCharts(updated);
    const newAll = [...DEFAULT_CHARTS, ...updated];
    if (activeTab >= newAll.length) {
      setActiveTab(newAll.length - 1);
    }
    setLongPressId(null);
  };

  const handleLongPressStart = (chartId: string, removable: boolean) => {
    if (!removable) return;
    longPressTimer.current = setTimeout(() => {
      setLongPressId(chartId);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-4 py-3">
        {DEFAULT_CHARTS.map((c) => (
          <div key={c.id} className="h-8 w-24 rounded-full bg-white/10 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10">
        <div
          ref={tabsRef}
          className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide"
        >
          {allCharts.map((chart, index) => (
            <motion.button
              key={chart.id}
              onClick={() => handleTabClick(index)}
              onTouchStart={() => handleLongPressStart(chart.id, chart.removable)}
              onTouchEnd={handleLongPressEnd}
              onMouseDown={() => handleLongPressStart(chart.id, chart.removable)}
              onMouseUp={handleLongPressEnd}
              whileTap={{ scale: 0.95 }}
              className={`relative flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold
                transition-all duration-200 whitespace-nowrap
                ${activeTab === index
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {activeTab === index && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #FF003330, #00D4FF30)',
                    border: '1px solid rgba(255,0,51,0.3)',
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">
                {chart.icon} {chart.label}
              </span>

              {/* Long press delete indicator */}
              <AnimatePresence>
                {longPressId === chart.id && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveChart(chart.id);
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500
                      flex items-center justify-center text-white text-xs z-20"
                  >
                    ×
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.button>
          ))}

          {/* Add Chart Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSheet(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full
              text-sm font-semibold text-gray-400 border border-white/10
              hover:border-white/20 hover:text-gray-200 transition-all whitespace-nowrap ml-1"
          >
            <span className="text-base leading-none">+</span>
            <span className="text-xs">Add</span>
          </motion.button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeChart.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <ChartList chart={activeChart} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add Chart Sheet */}
      <AddChartSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        currentCharts={allCharts}
        onAddChart={handleAddChart}
      />
    </div>
  );
}
