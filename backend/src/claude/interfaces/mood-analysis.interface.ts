export interface MoodAnalysis {
  moodLabel: string;
  interpretation: string;
  genres: string[];
  searchTerms: string[];
  energy: 'low' | 'medium' | 'high';
  valence: 'dark' | 'neutral' | 'bright';
  tempo: 'slow' | 'medium' | 'fast';
}
