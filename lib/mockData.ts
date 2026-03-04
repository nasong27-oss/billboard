import { ChartData } from './types';

const MOCK_SONGS = [
  { title: 'Blinding Lights', artist: 'The Weeknd' },
  { title: 'As It Was', artist: 'Harry Styles' },
  { title: 'Heat Waves', artist: 'Glass Animals' },
  { title: 'Stay', artist: 'The Kid LAROI & Justin Bieber' },
  { title: 'Easy On Me', artist: 'Adele' },
  { title: 'Industry Baby', artist: 'Lil Nas X & Jack Harlow' },
  { title: 'Bad Habits', artist: 'Ed Sheeran' },
  { title: 'Butter', artist: 'BTS' },
  { title: 'Levitating', artist: 'Dua Lipa Featuring DaBaby' },
  { title: 'Montero (Call Me By Your Name)', artist: 'Lil Nas X' },
  { title: 'Kiss Me More', artist: 'Doja Cat Featuring SZA' },
  { title: 'Peaches', artist: 'Justin Bieber Featuring Daniel Caesar & Giveon' },
  { title: 'Leave The Door Open', artist: 'Silk Sonic' },
  { title: 'Good 4 U', artist: 'Olivia Rodrigo' },
  { title: 'Drivers License', artist: 'Olivia Rodrigo' },
  { title: 'Save Your Tears', artist: 'The Weeknd & Ariana Grande' },
  { title: 'Watermelon Sugar', artist: 'Harry Styles' },
  { title: 'Positions', artist: 'Ariana Grande' },
  { title: 'Golden Hour', artist: 'JVKE' },
  { title: 'Anti-Hero', artist: 'Taylor Swift' },
  { title: 'Flowers', artist: 'Miley Cyrus' },
  { title: 'Cruel Summer', artist: 'Taylor Swift' },
  { title: 'Unholy', artist: 'Sam Smith & Kim Petras' },
  { title: 'Calm Down', artist: 'Rema & Selena Gomez' },
  { title: 'About Damn Time', artist: 'Lizzo' },
  { title: 'Break My Soul', artist: 'Beyoncé' },
  { title: 'Running Up That Hill', artist: 'Kate Bush' },
  { title: 'Arcade', artist: 'Duncan Laurence' },
  { title: 'Me Porto Bonito', artist: 'Bad Bunny & Chencho Corleone' },
  { title: 'Tití Me Preguntó', artist: 'Bad Bunny' },
  { title: 'Wait For U', artist: 'Future Featuring Drake & Tems' },
  { title: 'Light Switch', artist: 'Charlie Puth' },
  { title: 'Cold Heart', artist: 'Elton John & Dua Lipa' },
  { title: 'Woman', artist: 'Doja Cat' },
  { title: 'Shivers', artist: 'Ed Sheeran' },
  { title: 'Oh My God', artist: 'Adele' },
  { title: 'Love Story (Taylor\'s Version)', artist: 'Taylor Swift' },
  { title: 'Dynamite', artist: 'BTS' },
  { title: 'You Right', artist: 'Doja Cat & The Weeknd' },
  { title: 'Need To Know', artist: 'Doja Cat' },
];

function generateMockChart(chartId: string): ChartData {
  const songs = MOCK_SONGS.slice(0, 40).map((song, index) => {
    const rank = index + 1;
    const lastWeek = rank + Math.floor(Math.random() * 10) - 5;
    return {
      rank,
      title: song.title,
      artist: song.artist,
      cover: '',
      position: {
        positionLastWeek: lastWeek < 1 ? 0 : lastWeek > 100 ? 0 : lastWeek,
        peakPosition: Math.max(1, rank - Math.floor(Math.random() * 5)),
        weeksOnChart: Math.floor(Math.random() * 20) + 1,
      },
    };
  });

  return {
    chart: chartId,
    week: new Date().toISOString().split('T')[0],
    songs,
  };
}

export const MOCK_CHARTS: Record<string, ChartData> = {
  'hot-100': generateMockChart('hot-100'),
  'rock-songs': generateMockChart('rock-songs'),
  'mainstream-rock-songs': generateMockChart('mainstream-rock-songs'),
};

export function getMockChart(chartId: string): ChartData {
  return MOCK_CHARTS[chartId] || generateMockChart(chartId);
}
