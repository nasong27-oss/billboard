const cache = new Map<string, string>();

export async function fetchAlbumArt(title: string, artist: string): Promise<string> {
  const key = `${title}:${artist}`;
  if (cache.has(key)) {
    return cache.get(key)!;
  }

  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${query}&media=music&limit=1`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return '';

    const data = await res.json();
    const artworkUrl = data.results?.[0]?.artworkUrl100?.replace('100x100', '300x300') || '';
    cache.set(key, artworkUrl);
    return artworkUrl;
  } catch {
    return '';
  }
}
