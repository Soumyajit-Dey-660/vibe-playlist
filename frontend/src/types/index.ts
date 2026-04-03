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
  tracks: Track[];
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
