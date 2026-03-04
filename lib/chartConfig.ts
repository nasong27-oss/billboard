export interface ChartConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
  removable: boolean;
}

export const DEFAULT_CHARTS: ChartConfig[] = [
  { id: 'hot-100', label: 'Hot 100', icon: '🔥', description: 'The Billboard Hot 100', removable: false },
  { id: 'rock-songs', label: 'Modern Rock', icon: '🎸', description: 'Modern Rock Songs Chart', removable: false },
  { id: 'mainstream-rock-songs', label: 'Mainstream Rock', icon: '🎵', description: 'Mainstream Rock Songs Chart', removable: false },
];

export const ADDABLE_CHARTS: ChartConfig[] = [
  { id: 'billboard-global-200', label: 'Global 200', icon: '🌟', description: 'Billboard Global 200', removable: true },
  { id: 'adult-alternative-songs', label: 'Adult Alternative', icon: '🎸', description: 'Adult Alternative Songs', removable: true },
  { id: 'rap-song', label: 'Rap Songs', icon: '🎤', description: 'Rap Songs Chart', removable: true },
  { id: 'dance-electronic-songs', label: 'Dance/Electronic', icon: '💃', description: 'Dance/Electronic Songs', removable: true },
  { id: 'billboard-global-excl-us', label: 'Global Excl. U.S.', icon: '🌍', description: 'Global Excluding U.S.', removable: true },
  { id: 'pop-airplay', label: 'Pop Airplay', icon: '🎹', description: 'Pop Airplay Chart', removable: true },
  { id: 'artist-100', label: 'Artist 100', icon: '🏆', description: 'Artist 100 Chart', removable: true },
];
