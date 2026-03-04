declare module 'billboard-top-100' {
  interface SongPosition {
    positionLastWeek: number;
    peakPosition: number;
    weeksOnChart: number;
  }

  interface Song {
    rank: number;
    title: string;
    artist: string;
    cover: string;
    position: SongPosition;
  }

  interface Chart {
    date: string;
    songs: Song[];
  }

  type Callback = (err: Error | null, chart: Chart) => void;

  function getChart(chart: string, callback: Callback): void;
  function getChart(chart: string, date: string, callback: Callback): void;

  const _default: {
    getChart: typeof getChart;
  };

  export { getChart };
  export default _default;
}
