import type { DrawingTool } from '../../types';
import './Toolbar.css';

const PRESET_COLORS = [
  '#ffffff',
  '#ff4757',
  '#ff6b35',
  '#ffd700',
  '#2ed573',
  '#1e90ff',
  '#a855f7',
  '#ff69b4',
  '#00d2d3',
  '#1a1a2e',
];

const TOOLS: { id: DrawingTool; label: string; icon: string }[] = [
  { id: 'brush', label: 'Brush', icon: '✏️' },
  { id: 'eraser', label: 'Eraser', icon: '🧹' },
  { id: 'line', label: 'Line', icon: '╱' },
  { id: 'rectangle', label: 'Rect', icon: '▭' },
  { id: 'circle', label: 'Circle', icon: '○' },
];

interface ToolbarProps {
  tool: DrawingTool;
  color: string;
  brushSize: number;
  onToolChange: (t: DrawingTool) => void;
  onColorChange: (c: string) => void;
  onBrushSizeChange: (s: number) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function Toolbar({
  tool,
  color,
  brushSize,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onClear,
  onUndo,
  onRedo,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-section tools">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            className={`tool-btn ${tool === t.id ? 'active' : ''}`}
            onClick={() => onToolChange(t.id)}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section colors">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            className={`color-swatch ${color === c ? 'active' : ''}`}
            style={{ background: c }}
            onClick={() => onColorChange(c)}
            title={c}
          />
        ))}
        <label className="color-custom" title="Custom color">
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
          />
          <span className="color-custom-icon">+</span>
        </label>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section size">
        <span className="size-label">Size</span>
        <input
          type="range"
          min={2}
          max={40}
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="size-slider"
        />
        <span className="size-value">{brushSize}px</span>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section actions">
        <button className="action-btn" onClick={onUndo} title="Undo (Ctrl+Z)">
          ↩
        </button>
        <button className="action-btn" onClick={onRedo} title="Redo (Ctrl+Y)">
          ↪
        </button>
        <button
          className="action-btn danger"
          onClick={onClear}
          title="Clear canvas"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
