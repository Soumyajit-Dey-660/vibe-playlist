import { useRef, useState } from 'react';
import type { SpotifyTrack } from '../../types';
import './TrackCard.css';

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

interface TrackCardProps {
  track: SpotifyTrack;
  index: number;
}

export function TrackCard({ track, index }: TrackCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePreview = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => setIsPlaying(false);

  return (
    <div className="track-card">
      <span className="track-index">{index + 1}</span>

      {track.albumArtUrl ? (
        <img
          className="track-art"
          src={track.albumArtUrl}
          alt={track.album}
          loading="lazy"
        />
      ) : (
        <div className="track-art-placeholder">♫</div>
      )}

      <div className="track-info">
        <span className="track-name">{track.name}</span>
        <span className="track-artist">{track.artists.join(', ')}</span>
        <span className="track-album">{track.album}</span>
      </div>

      <div className="track-actions">
        {track.previewUrl && (
          <>
            <button
              className={`preview-btn ${isPlaying ? 'playing' : ''}`}
              onClick={togglePreview}
              title={isPlaying ? 'Stop preview' : 'Play 30s preview'}
            >
              {isPlaying ? '■' : '▶'}
            </button>
            <audio
              ref={audioRef}
              src={track.previewUrl}
              onEnded={handleAudioEnded}
            />
          </>
        )}
        <span className="track-duration">
          {formatDuration(track.durationMs)}
        </span>
        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="spotify-link"
          title="Open in Spotify"
        >
          ↗
        </a>
      </div>
    </div>
  );
}
