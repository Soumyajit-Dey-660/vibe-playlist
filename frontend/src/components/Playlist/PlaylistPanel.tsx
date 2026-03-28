import { useEffect, useState } from 'react';
import type { PlaylistResponse } from '../../types';
import { MoodCard } from './MoodCard';
import { TrackCard } from './TrackCard';
import './PlaylistPanel.css';

const LOADING_MESSAGES = [
  'Reading your mood...',
  'Consulting the vibes...',
  'Searching for matching tracks...',
  'Curating your playlist...',
  'Almost there...',
];

interface PlaylistPanelProps {
  result: PlaylistResponse | null;
  isLoading: boolean;
  error: string | null;
  onDismissError: () => void;
}

export function PlaylistPanel({
  result,
  isLoading,
  error,
  onDismissError,
}: PlaylistPanelProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    setMsgIndex(0);
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(id);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="playlist-panel loading">
        <div className="loading-content">
          <div className="loading-spinner" />
          <p className="loading-message">{LOADING_MESSAGES[msgIndex]}</p>
          <p className="loading-sub">Claude is analyzing your drawing</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="playlist-panel error-state">
        <div className="error-content">
          <span className="error-icon">⚠</span>
          <p className="error-message">{error}</p>
          <button className="error-dismiss" onClick={onDismissError}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="playlist-panel empty">
        <div className="empty-content">
          <div className="empty-icon">🎨</div>
          <h3 className="empty-title">Draw Your Mood</h3>
          <p className="empty-description">
            Scribble, sketch, or paint anything on the canvas.
            <br />
            Claude will read the energy and find your soundtrack.
          </p>
          <div className="empty-examples">
            <span>Jagged lines → Punk</span>
            <span>Soft spirals → Lo-fi</span>
            <span>Bright splashes → Indie pop</span>
            <span>Dark swirls → Ambient</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="playlist-panel results">
      <div className="panel-header">
        <h2 className="panel-title">Your Playlist</h2>
        <span className="track-count">{result.tracks.length} tracks</span>
      </div>

      <div className="panel-scroll">
        <MoodCard mood={result.mood} />

        <div className="tracks-list">
          {result.tracks.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
