import { NextRequest, NextResponse } from 'next/server';
import { fetchBillboardChart } from '@/lib/billboard';

export const revalidate = 3600; // 1 hour cache

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chartId: string }> }
) {
  const { chartId } = await params;

  try {
    // Return chart data immediately — album art is fetched client-side per card
    const chartData = await fetchBillboardChart(chartId);

    return NextResponse.json(chartData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Chart fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
