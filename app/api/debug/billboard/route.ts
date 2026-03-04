/**
 * Debug endpoint: GET /api/debug/billboard?chart=hot-100
 *
 * Returns the raw __NEXT_DATA__ pageProps structure from Billboard
 * so we can verify/update the parser paths.
 * Only enabled in development (NODE_ENV !== 'production').
 */
import { NextRequest, NextResponse } from 'next/server';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Debug endpoint disabled in production' }, { status: 403 });
  }

  const chart = req.nextUrl.searchParams.get('chart') ?? 'hot-100';
  const url = `https://www.billboard.com/charts/${chart}/`;

  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Billboard returned ${res.status}` });
    }

    const html = await res.text();
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/
    );

    if (!match) {
      return NextResponse.json({
        error: '__NEXT_DATA__ not found',
        htmlSample: html.slice(0, 500),
      });
    }

    const nextData = JSON.parse(match[1]);
    const pageProps = nextData?.props?.pageProps ?? {};

    // Return keys + shallow sample of each top-level key
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summary: Record<string, any> = { _keys: Object.keys(pageProps) };
    for (const key of Object.keys(pageProps)) {
      const val = pageProps[key];
      if (Array.isArray(val)) {
        summary[key] = `Array(${val.length}), first item keys: ${Object.keys(val[0] ?? {}).join(', ')}`;
      } else if (val && typeof val === 'object') {
        summary[key] = { _keys: Object.keys(val), _sample: JSON.stringify(val).slice(0, 200) };
      } else {
        summary[key] = val;
      }
    }

    return NextResponse.json({ chart, summary, firstEntry: pageProps?.chartDetails?.entries?.[0] ?? null });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message });
  }
}
