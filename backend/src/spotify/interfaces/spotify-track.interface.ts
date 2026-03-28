export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  artists: string[];
  album: string;
  albumArtUrl: string;
  spotifyUrl: string;
  previewUrl: string | null;
  durationMs: number;
  popularity: number;
}
