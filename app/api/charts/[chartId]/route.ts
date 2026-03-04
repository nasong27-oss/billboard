import { NextRequest, NextResponse } from 'next/server';
import { fetchBillboardChart } from '@/lib/billboard';
import { fetchAlbumArt } from '@/lib/itunes';

export const revalidate = 3600; // 1 hour cache

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chartId: string }> }
) {
  const { chartId } = await params;

  try {
    const chartData = await fetchBillboardChart(chartId);

    // Fetch album art for each song
    const songsWithArt = await Promise.all(
      chartData.songs.map(async (song) => {
        const image = await fetchAlbumArt(song.title, song.artist);
        return { ...song, image };
      })
    );

    return NextResponse.json(
      { ...chartData, songs: songsWithArt },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Chart fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
