export interface ChartSong {
  rank: number;
  title: string;
  artist: string;
  cover: string;
  position: {
    positionLastWeek: number;
    peakPosition: number;
    weeksOnChart: number;
  };
  image?: string; // iTunes album art URL
}

export interface ChartData {
  chart: string;
  week: string;
  songs: ChartSong[];
}
