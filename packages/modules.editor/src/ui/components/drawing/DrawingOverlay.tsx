import { useCallback, useEffect, useRef } from 'react';
import { DrawToolT, StrokeT } from '../../../types';

type DrawingOverlayPropsT = {
  strokes: StrokeT[];
  onChangeStrokes: (strokes: StrokeT[]) => void;
  tool: DrawToolT;
  active: boolean;
  className?: string;
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export const DrawingOverlay = ({
  strokes,
  onChangeStrokes,
  tool,
  active,
  className,
}: DrawingOverlayPropsT) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveStrokeRef = useRef<StrokeT | null>(null);
  const lastSizeRef = useRef({ w: 0, h: 0 });

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const all = liveStrokeRef.current ? [...strokes, liveStrokeRef.current] : strokes;

    for (const stroke of all) {
      if (stroke.points.length < 2) continue;
      ctx.globalCompositeOperation = stroke.mode === 'erase' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = Math.max(1, stroke.size * canvas.width);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      stroke.points.forEach((p, i) => {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }, [strokes]);

  // ресайз — тот же паттерн, что уже используется в PdfViewer
  useEffect(() => {
    const el = containerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w <= 0 || h <= 0) return;
      if (lastSizeRef.current.w === w && lastSizeRef.current.h === h) return;
      lastSizeRef.current = { w, h };

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      redraw();
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [redraw]);

  useEffect(() => {
    redraw();
  }, [redraw, strokes]);

  const getPoint = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!active) return;
      const point = getPoint(e);
      if (!point) return;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      liveStrokeRef.current = {
        id: makeId(),
        color: tool.color,
        size: tool.mode === 'erase' ? tool.size * 2.5 : tool.size,
        mode: tool.mode,
        points: [point],
      };
      redraw();
    },
    [active, tool, getPoint, redraw],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!active || !liveStrokeRef.current) return;
      const point = getPoint(e);
      if (!point) return;
      liveStrokeRef.current.points.push(point);
      redraw();
    },
    [active, getPoint, redraw],
  );

  const handlePointerUp = useCallback(() => {
    const finished = liveStrokeRef.current;
    liveStrokeRef.current = null;
    if (finished && finished.points.length > 1) {
      onChangeStrokes([...strokes, finished]);
    } else {
      redraw();
    }
  }, [strokes, onChangeStrokes, redraw]);

  return (
    <div ref={containerRef} className={className}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{
          pointerEvents: active ? 'auto' : 'none',
          cursor: active ? 'crosshair' : 'default',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
};
