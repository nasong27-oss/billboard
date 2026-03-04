'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChartSong } from '@/lib/types';

interface SongCardProps {
  song: ChartSong;
  index: number;
}

function RankChange({ current, last }: { current: number; last: number }) {
  if (last === 0) {
    return (
      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
        NEW
      </span>
    );
  }
  const diff = last - current;
  if (diff > 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-bold text-green-400">
        <span>▲</span>
        <span>{diff}</span>
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-bold text-red-400">
        <span>▼</span>
        <span>{Math.abs(diff)}</span>
      </span>
    );
  }
  return <span className="text-xs font-bold text-gray-500">—</span>;
}

export default function SongCard({ song, index }: SongCardProps) {
  const appleLink = `https://music.apple.com/search?term=${encodeURIComponent(`${song.title} ${song.artist}`)}`;
  const spotifyLink = `https://open.spotify.com/search/${encodeURIComponent(`${song.title} ${song.artist}`)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      className="relative flex items-center gap-3 p-3 rounded-xl
        bg-white/5 backdrop-blur-sm border border-white/10
        hover:bg-white/8 hover:border-white/20 transition-all duration-200"
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-10 text-center">
        <span
          className="font-display text-2xl font-black leading-none"
          style={{
            color: song.rank <= 3 ? '#FF0033' : song.rank <= 10 ? '#00D4FF' : '#6b7280',
          }}
        >
          {song.rank}
        </span>
      </div>

      {/* Album Art */}
      <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-white/10">
        {song.image ? (
          <Image
            src={song.image}
            alt={`${song.title} album art`}
            width={56}
            height={56}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-white/10 to-white/5">
            🎵
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-white truncate leading-tight">{song.title}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{song.artist}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <RankChange current={song.rank} last={song.position.positionLastWeek} />
          <span className="text-xs text-gray-600">
            {song.position.weeksOnChart}wk
          </span>
        </div>
      </div>

      {/* Streaming Buttons */}
      <div className="flex-shrink-0 flex flex-col gap-1.5">
        <motion.a
          href={appleLink}
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-8 h-8 rounded-lg
            bg-white text-black text-xs font-bold hover:bg-gray-100 transition-colors"
          title="Apple Music"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        </motion.a>
        <motion.a
          href={spotifyLink}
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-white text-xs font-bold transition-colors"
          style={{ backgroundColor: '#1DB954' }}
          title="Spotify"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </motion.a>
      </div>
    </motion.div>
  );
}
