'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartSong } from '@/lib/types';
import { ChartConfig } from '@/lib/chartConfig';
import {
  initiateSpotifyAuth,
  exchangeCodeForToken,
  getStoredToken,
  searchSpotifyTrack,
  createSpotifyPlaylist,
} from '@/lib/spotify';

interface SpotifyButtonProps {
  chart: ChartConfig;
  songs: ChartSong[];
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function SpotifyButton({ chart, songs }: SpotifyButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

  const createPlaylist = useCallback(async (token: string) => {
    setStatus('loading');
    setProgress(0);

    try {
      const trackUris: string[] = [];
      for (let i = 0; i < songs.length; i++) {
        const uri = await searchSpotifyTrack(token, songs[i].title, songs[i].artist);
        if (uri) trackUris.push(uri);
        setProgress(Math.round(((i + 1) / songs.length) * 100));
      }

      const url = await createSpotifyPlaylist(token, chart.label, trackUris);
      setPlaylistUrl(url);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [songs, chart.label]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('spotify_code');
    if (!code) return;

    // Clean URL
    const url = new URL(window.location.href);
    url.searchParams.delete('spotify_code');
    window.history.replaceState({}, '', url);

    // Exchange code for token and create playlist
    const pendingChart = sessionStorage.getItem('spotify_pending_chart');
    if (pendingChart === chart.id) {
      exchangeCodeForToken(code)
        .then((token) => createPlaylist(token))
        .catch(() => setStatus('error'));
    }
  }, [chart.id, createPlaylist]);

  const handleClick = async () => {
    if (!clientId) return;

    const token = getStoredToken();
    if (token) {
      createPlaylist(token);
    } else {
      sessionStorage.setItem('spotify_pending_chart', chart.id);
      await initiateSpotifyAuth();
    }
  };

  if (!clientId) return null;

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === 'success' && playlistUrl ? (
          <motion.a
            key="success"
            href={playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-semibold"
            style={{ backgroundColor: '#1DB954' }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Open Playlist
          </motion.a>
        ) : status === 'loading' ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs"
            style={{ backgroundColor: '#1DB954' }}
          >
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {progress}%
          </motion.div>
        ) : (
          <motion.button
            key="button"
            onClick={handleClick}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-semibold transition-all"
            style={{ backgroundColor: status === 'error' ? '#ef4444' : '#1DB954' }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            {status === 'error' ? 'Retry' : 'Create Playlist'}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
