import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 86400; // 24 hour cache

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ url: '' });

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${q}&media=music&limit=1`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return NextResponse.json({ url: '' });

    const data = await res.json();
    const url =
      data.results?.[0]?.artworkUrl100?.replace('100x100bb', '300x300bb') || '';

    return NextResponse.json({ url }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
    });
  } catch {
    return NextResponse.json({ url: '' });
  }
}
