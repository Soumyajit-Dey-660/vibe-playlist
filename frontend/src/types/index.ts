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

export interface MoodResult {
  moodLabel: string;
  interpretation: string;
  genres: string[];
  energy: 'low' | 'medium' | 'high';
  valence: 'dark' | 'neutral' | 'bright';
  tempo: 'slow' | 'medium' | 'fast';
}

export interface PlaylistResponse {
  mood: MoodResult;
  tracks: SpotifyTrack[];
  generatedAt: string;
}

export interface GeneratePlaylistRequest {
  imageBase64: string;
  trackCount?: number;
}

export type DrawingTool = 'brush' | 'eraser' | 'line' | 'rectangle' | 'circle';

export interface Point {
  x: number;
  y: number;
}
