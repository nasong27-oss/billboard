import { ChartData, ChartSong } from './types';
import { getMockChart } from './mockData';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBillboardSong(song: any, index: number): ChartSong {
  return {
    rank: song.rank || index + 1,
    title: song.title || 'Unknown Title',
    artist: song.artist || 'Unknown Artist',
    cover: song.cover || '',
    position: {
      positionLastWeek: song.position?.positionLastWeek || 0,
      peakPosition: song.position?.peakPosition || song.rank || index + 1,
      weeksOnChart: song.position?.weeksOnChart || 1,
    },
  };
}

export async function fetchBillboardChart(chartId: string): Promise<ChartData> {
  try {
    const billboard = await import('billboard-top-100');
    const getChart = billboard.default?.getChart || billboard.getChart;

    if (!getChart) {
      console.warn('billboard-top-100 module structure unexpected, using mock data');
      return getMockChart(chartId);
    }

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Billboard fetch timeout')), 8000)
    );

    const data = await Promise.race([
      new Promise<ChartData>((resolve, reject) => {
        getChart(chartId, (err: Error | null, chart: { date: string; songs: unknown[] }) => {
          if (err) {
            reject(err);
            return;
          }
          const songs = (chart.songs || []).slice(0, 40).map(parseBillboardSong);
          resolve({
            chart: chartId,
            week: chart.date || new Date().toISOString().split('T')[0],
            songs,
          });
        });
      }),
      timeout,
    ]);

    return data;
  } catch (error) {
    console.warn(`Failed to fetch billboard chart ${chartId}:`, error);
    return getMockChart(chartId);
  }
}
