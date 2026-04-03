export interface Track {
  id: string;
  name: string;
  artist: string;
  artists: string[];
  album: string;
  albumArtUrl: string;
  trackUrl: string;
  previewUrl: string | null;
  durationMs: number;
}
