import type { MoodResult } from '../../types';
import './MoodCard.css';

const ENERGY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };
const VALENCE_EMOJI = { dark: '🌑', neutral: '🌤', bright: '☀️' };
const TEMPO_LABELS = { slow: 'Slow', medium: 'Mid', fast: 'Fast' };

interface MoodCardProps {
  mood: MoodResult;
}

export function MoodCard({ mood }: MoodCardProps) {
  return (
    <div className="mood-card">
      <div className="mood-header">
        <span className="mood-valence">{VALENCE_EMOJI[mood.valence]}</span>
        <div>
          <h2 className="mood-label">{mood.moodLabel}</h2>
          <p className="mood-interpretation">{mood.interpretation}</p>
        </div>
      </div>

      <div className="mood-stats">
        <div className="stat">
          <span className="stat-label">Energy</span>
          <div className="energy-bar">
            <div
              className={`energy-fill energy-${mood.energy}`}
              style={{
                width:
                  mood.energy === 'low'
                    ? '33%'
                    : mood.energy === 'medium'
                      ? '66%'
                      : '100%',
              }}
            />
          </div>
          <span className="stat-value">{ENERGY_LABELS[mood.energy]}</span>
        </div>

        <div className="stat">
          <span className="stat-label">Tempo</span>
          <span className="stat-badge">{TEMPO_LABELS[mood.tempo]}</span>
        </div>
      </div>

      <div className="mood-genres">
        {mood.genres.map((genre) => (
          <span key={genre} className="genre-tag">
            {genre}
          </span>
        ))}
      </div>
    </div>
  );
}
