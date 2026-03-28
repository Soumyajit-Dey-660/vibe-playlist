import { useCanvas } from '../../hooks/useCanvas';
import { Toolbar } from './Toolbar';
import './DrawingCanvas.css';

interface DrawingCanvasProps {
  onSubmit: (base64Image: string) => void;
  isLoading: boolean;
}

export function DrawingCanvas({ onSubmit, isLoading }: DrawingCanvasProps) {
  const {
    canvasRef,
    tool,
    color,
    brushSize,
    setTool,
    setColor,
    setBrushSize,
    clearCanvas,
    undo,
    redo,
    exportAsBase64,
  } = useCanvas();

  const handleGenerate = () => {
    const base64 = exportAsBase64();
    if (base64) onSubmit(base64);
  };

  return (
    <div className="canvas-panel">
      <Toolbar
        tool={tool}
        color={color}
        brushSize={brushSize}
        onToolChange={setTool}
        onColorChange={setColor}
        onBrushSizeChange={setBrushSize}
        onClear={clearCanvas}
        onUndo={undo}
        onRedo={redo}
      />

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} className="drawing-canvas" />
        {isLoading && (
          <div className="canvas-overlay">
            <div className="overlay-spinner" />
            <p className="overlay-text">Analyzing your vibe...</p>
          </div>
        )}
      </div>

      <div className="canvas-footer">
        <p className="canvas-hint">
          Draw your mood — scribbles, shapes, anything goes
        </p>
        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="btn-spinner" />
              Generating...
            </>
          ) : (
            <>
              <span className="spotify-icon">♫</span>
              Generate Playlist
            </>
          )}
        </button>
      </div>
    </div>
  );
}
