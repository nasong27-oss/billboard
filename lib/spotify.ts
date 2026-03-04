const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
const REDIRECT_URI = typeof window !== 'undefined'
  ? `${window.location.origin}/api/spotify/callback`
  : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/spotify/callback`;

// PKCE helpers
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function initiateSpotifyAuth(): Promise<void> {
  if (!SPOTIFY_CLIENT_ID) {
    alert('Spotify Client ID not configured. Please set NEXT_PUBLIC_SPOTIFY_CLIENT_ID.');
    return;
  }

  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  sessionStorage.setItem('spotify_code_verifier', verifier);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'playlist-modify-public playlist-modify-private',
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const verifier = sessionStorage.getItem('spotify_code_verifier');
  if (!verifier) throw new Error('No code verifier found');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      code_verifier: verifier,
    }),
  });

  if (!res.ok) throw new Error('Failed to exchange code for token');
  const data = await res.json();
  sessionStorage.setItem('spotify_access_token', data.access_token);
  sessionStorage.removeItem('spotify_code_verifier');
  return data.access_token;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('spotify_access_token');
}

export async function searchSpotifyTrack(
  token: string,
  title: string,
  artist: string
): Promise<string | null> {
  const query = encodeURIComponent(`track:${title} artist:${artist}`);
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.tracks?.items?.[0]?.uri || null;
}

export async function createSpotifyPlaylist(
  token: string,
  chartName: string,
  trackUris: string[]
): Promise<string> {
  // Get user profile
  const profileRes = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!profileRes.ok) throw new Error('Failed to get Spotify profile');
  const profile = await profileRes.json();

  // Create playlist
  const createRes = await fetch(
    `https://api.spotify.com/v1/users/${profile.id}/playlists`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Billboard ${chartName} - ${new Date().toLocaleDateString()}`,
        description: `Auto-generated Billboard ${chartName} playlist`,
        public: false,
      }),
    }
  );
  if (!createRes.ok) throw new Error('Failed to create playlist');
  const playlist = await createRes.json();

  // Add tracks in batches of 100
  for (let i = 0; i < trackUris.length; i += 100) {
    const batch = trackUris.slice(i, i + 100);
    await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: batch }),
    });
  }

  return playlist.external_urls.spotify;
}
