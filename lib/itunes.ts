// Client-side in-memory cache (per browser session)
const clientCache = new Map<string, string>();

export async function fetchAlbumArtClient(title: string, artist: string): Promise<string> {
  const key = `${title}:${artist}`;
  if (clientCache.has(key)) {
    return clientCache.get(key)!;
  }

  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(
      `/api/itunes?q=${query}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return '';
    const data = await res.json();
    const url = data.url || '';
    clientCache.set(key, url);
    return url;
  } catch {
    return '';
  }
}
