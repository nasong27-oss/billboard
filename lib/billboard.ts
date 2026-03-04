import { ChartData, ChartSong } from './types';
import { getMockChart } from './mockData';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractEntries(pageProps: any): any[] | null {
  // Billboard's __NEXT_DATA__ structure has shifted a few times.
  // Try each known path in order.
  const candidates = [
    pageProps?.chartDetails?.entries,
    pageProps?.data?.chartHistory?.entries,
    pageProps?.data?.entries,
    pageProps?.chart?.entries,
    pageProps?.entries,
  ];
  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) return c;
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEntry(entry: any, index: number): ChartSong {
  // rank
  const rank = entry.currentRank ?? entry.rank ?? index + 1;

  // title / artist
  const title = entry.title ?? entry.name ?? 'Unknown';
  const artist = entry.artist ?? entry.artistName ?? entry.credits ?? 'Unknown';

  // image (Billboard CDN URL)
  const image = entry.image ?? entry.thumbnailUrl ?? entry.coverUrl ?? '';

  // position history — Billboard nests this differently per chart type
  const history = entry.rankingHistory?.[0] ?? entry.data?.cs ?? entry.history?.[0] ?? entry;

  const positionLastWeek =
    history.lastWeek ?? history.lw ?? entry.lastWeekRank ?? entry.lastWeek ?? 0;
  const peakPosition =
    history.peakRank ?? history.pp ?? entry.peakRank ?? entry.peak ?? rank;
  const weeksOnChart =
    history.weeksOnChart ?? history.woc ?? entry.weeksOnChart ?? entry.weeks ?? 1;

  return {
    rank,
    title,
    artist,
    cover: image,
    position: {
      positionLastWeek: Number(positionLastWeek) || 0,
      peakPosition: Number(peakPosition) || rank,
      weeksOnChart: Number(weeksOnChart) || 1,
    },
  };
}

async function scrapeBillboard(chartId: string): Promise<ChartData> {
  const url = `https://www.billboard.com/charts/${chartId}/`;

  const res = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    throw new Error(`Billboard returned ${res.status} for ${chartId}`);
  }

  const html = await res.text();

  // Extract __NEXT_DATA__ JSON blob
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
  if (!match) {
    throw new Error('__NEXT_DATA__ not found in Billboard page');
  }

  const nextData = JSON.parse(match[1]);
  const pageProps = nextData?.props?.pageProps;

  // Resolve chart date
  const chartDate: string =
    pageProps?.chartDetails?.latestChartDate ??
    pageProps?.data?.chartDate ??
    pageProps?.chartDate ??
    new Date().toISOString().split('T')[0];

  const entries = extractEntries(pageProps);
  if (!entries) {
    // Log the actual keys so we can debug if structure changes again
    console.warn('[billboard scraper] Unknown pageProps structure, keys:', Object.keys(pageProps ?? {}));
    throw new Error('Could not find chart entries in Billboard data');
  }

  const songs: ChartSong[] = entries
    .slice(0, 40)
    .map((entry, i) => parseEntry(entry, i))
    .filter((s) => s.title !== 'Unknown');

  return { chart: chartId, week: chartDate, songs };
}

export async function fetchBillboardChart(chartId: string): Promise<ChartData> {
  try {
    return await scrapeBillboard(chartId);
  } catch (error) {
    console.warn(`[billboard] Failed for "${chartId}", using mock:`, (error as Error).message);
    return getMockChart(chartId);
  }
}
