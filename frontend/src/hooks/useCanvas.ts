import { useRef, useState, useEffect, useCallback } from 'react';
import type { DrawingTool, Point } from '../types';

const CANVAS_BG = '#1a1a2e';
const MAX_HISTORY = 20;

interface CanvasState {
  tool: DrawingTool;
  color: string;
  brushSize: number;
}

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<DrawingTool>('brush');
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(8);

  const isDrawingRef = useRef(false);
  const startPointRef = useRef<Point | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);
  const snapshotRef = useRef<ImageData | null>(null);
  const stateRef = useRef<CanvasState>({ tool, color, brushSize });

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = { tool, color, brushSize };
  }, [tool, color, brushSize]);

  const getCtx = useCallback((): CanvasRenderingContext2D | null => {
    return canvasRef.current?.getContext('2d') ?? null;
  }, []);

  const getPoint = useCallback((e: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const source = 'touches' in e ? e.touches[0] : e;
    return {
      x: (source.clientX - rect.left) * scaleX,
      y: (source.clientY - rect.top) * scaleY,
    };
  }, []);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Discard redo states
    historyRef.current = historyRef.current.slice(
      0,
      historyIndexRef.current + 1,
    );
    historyRef.current.push(snapshot);
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    }
    historyIndexRef.current = historyRef.current.length - 1;
  }, [getCtx]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const { offsetWidth, offsetHeight } = canvas;
    canvas.width = offsetWidth * dpr;
    canvas.height = offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, offsetWidth, offsetHeight);
    // Reset history
    historyRef.current = [];
    historyIndexRef.current = -1;
    saveHistory();
  }, [saveHistory]);

  // Initialize on mount
  useEffect(() => {
    initCanvas();

    const handleResize = () => {
      const canvas = canvasRef.current;
      const ctx = getCtx();
      if (!canvas || !ctx) return;
      // Save current pixels
      const saved = ctx.getImageData(0, 0, canvas.width, canvas.height);
      initCanvas();
      ctx.putImageData(saved, 0, 0);
    };

    const observer = new ResizeObserver(handleResize);
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [initCanvas, getCtx]);

  const applyBrushStyle = useCallback((ctx: CanvasRenderingContext2D) => {
    const { tool: t, color: c, brushSize: s } = stateRef.current;
    ctx.lineWidth = s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (t === 'eraser') {
      ctx.strokeStyle = CANVAS_BG;
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.strokeStyle = c;
      ctx.globalCompositeOperation = 'source-over';
    }
  }, []);

  const drawShape = useCallback(
    (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
      const { tool: t, color: c, brushSize: s } = stateRef.current;
      ctx.strokeStyle = c;
      ctx.lineWidth = s;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();

      if (t === 'line') {
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
      } else if (t === 'rectangle') {
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        return;
      } else if (t === 'circle') {
        const rx = Math.abs(end.x - start.x) / 2;
        const ry = Math.abs(end.y - start.y) / 2;
        const cx = start.x + (end.x - start.x) / 2;
        const cy = start.y + (end.y - start.y) / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      }

      ctx.stroke();
    },
    [],
  );

  const onPointerDown = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const ctx = getCtx();
      if (!ctx) return;
      const pt = getPoint(e);
      isDrawingRef.current = true;
      startPointRef.current = pt;

      const { tool: t } = stateRef.current;
      if (t === 'brush' || t === 'eraser') {
        applyBrushStyle(ctx);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
      } else {
        // Shape tool — save snapshot for live preview
        const canvas = canvasRef.current!;
        snapshotRef.current = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
      }
    },
    [getCtx, getPoint, applyBrushStyle],
  );

  const onPointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const ctx = getCtx();
      if (!ctx) return;
      const pt = getPoint(e);

      const { tool: t } = stateRef.current;
      if (t === 'brush' || t === 'eraser') {
        applyBrushStyle(ctx);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      } else if (snapshotRef.current && startPointRef.current) {
        // Restore snapshot and redraw shape preview
        ctx.putImageData(snapshotRef.current, 0, 0);
        drawShape(ctx, startPointRef.current, pt);
      }
    },
    [getCtx, getPoint, applyBrushStyle, drawShape],
  );

  const onPointerUp = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      const ctx = getCtx();
      if (ctx) {
        const { tool: t } = stateRef.current;
        if (t === 'brush' || t === 'eraser') {
          ctx.closePath();
        }
      }

      saveHistory();
      snapshotRef.current = null;
      startPointRef.current = null;
    },
    [getCtx, saveHistory],
  );

  // Attach events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('mouseleave', onPointerUp);
    canvas.addEventListener('touchstart', onPointerDown, {
      passive: false,
    });
    canvas.addEventListener('touchmove', onPointerMove, { passive: false });
    canvas.addEventListener('touchend', onPointerUp, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', onPointerDown);
      canvas.removeEventListener('mousemove', onPointerMove);
      canvas.removeEventListener('mouseup', onPointerUp);
      canvas.removeEventListener('mouseleave', onPointerUp);
      canvas.removeEventListener('touchstart', onPointerDown);
      canvas.removeEventListener('touchmove', onPointerMove);
      canvas.removeEventListener('touchend', onPointerUp);
    };
  }, [onPointerDown, onPointerMove, onPointerUp]);

  // Keyboard undo/redo
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      if (e.key === 'z' && !e.shiftKey) undo();
      if (e.key === 'z' && e.shiftKey) redo();
      if (e.key === 'y') redo();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const undo = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
  }, [getCtx]);

  const redo = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || historyIndexRef.current >= historyRef.current.length - 1)
      return;
    historyIndexRef.current++;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
  }, [getCtx]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    saveHistory();
  }, [getCtx, saveHistory]);

  const exportAsBase64 = useCallback((): string => {
    return canvasRef.current?.toDataURL('image/png') ?? '';
  }, []);

  return {
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
  };
}
