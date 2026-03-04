'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SongCard from './SongCard';
import SpotifyButton from './SpotifyButton';
import { ChartData } from '@/lib/types';
import { ChartConfig } from '@/lib/chartConfig';

interface ChartListProps {
  chart: ChartConfig;
}

export default function ChartList({ chart }: ChartListProps) {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchChart = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/charts/${chart.id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [chart.id]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-white/5 animate-pulse"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <div className="text-4xl">😕</div>
        <p className="text-gray-400 text-sm">Failed to load chart data</p>
        <button
          onClick={fetchChart}
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-safe">
      {/* Chart Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs text-gray-500">Week of</p>
          <p className="text-sm text-gray-300 font-medium">{data.week}</p>
        </div>
        <SpotifyButton chart={chart} songs={data.songs} />
      </div>

      {/* Song List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={chart.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col gap-2 px-4 pb-8"
        >
          {data.songs.map((song, index) => (
            <SongCard key={`${chart.id}-${song.rank}`} song={song} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
