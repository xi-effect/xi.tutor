/**
 * Fullscreen transparent drawing surface for screen-share annotations.
 *
 * The window is excluded from display capture, so remote participants never see
 * it directly: strokes are mirrored to the main window in surface-relative
 * coordinates and re-drawn there on top of the incoming video.
 */

import { emit, listen } from '@tauri-apps/api/event';

type Tool = 'pointer' | 'pen' | 'highlighter' | 'eraser';
type DrawTool = Exclude<Tool, 'pointer'>;

type AnnotateCommand = {
  type: string;
  tool?: Tool;
  color?: string;
};

type Point = { x: number; y: number };

type Stroke = {
  id: string;
  tool: DrawTool;
  color: string;
  points: Point[];
};

/** Fractions of the surface: [x / width, y / height]. */
type NormalizedPoint = [number, number];

type AnnotationMessage =
  | {
      type: 'begin';
      stroke: {
        id: string;
        tool: DrawTool;
        color: string;
        width: number;
        points: NormalizedPoint[];
      };
    }
  | { type: 'append'; id: string; points: NormalizedPoint[] }
  | { type: 'end'; id: string }
  | { type: 'undo' }
  | { type: 'clear' };

const ANNOTATION_EVENT = 'share-annotate-stroke';
/** Line widths in CSS pixels, converted to surface fractions before sending. */
const TOOL_WIDTH: Record<DrawTool, number> = {
  pen: 3.5,
  highlighter: 22,
  eraser: 28,
};

const canvasEl = document.getElementById('annotate');
if (!(canvasEl instanceof HTMLCanvasElement)) {
  throw new Error('#annotate missing');
}
const canvas: HTMLCanvasElement = canvasEl;

const context = canvas.getContext('2d', { alpha: true });
if (!context) {
  throw new Error('2d context unavailable');
}
const ctx: CanvasRenderingContext2D = context;

let tool: Tool = 'pointer';
let color = '#ef4444';
let dpr = window.devicePixelRatio || 1;
const strokes: Stroke[] = [];
let current: Stroke | null = null;

function isDrawTool(value: Tool): value is DrawTool {
  return value === 'pen' || value === 'highlighter' || value === 'eraser';
}

let strokeCounter = 0;

function nextStrokeId(): string {
  strokeCounter += 1;
  return `${Date.now().toString(36)}-${strokeCounter}`;
}

function send(message: AnnotationMessage): void {
  void emit(ANNOTATION_EVENT, message).catch((err) => {
    console.error('[share-annotate] failed to publish stroke', err);
  });
}

function toNormalizedPoint(event: PointerEvent): NormalizedPoint {
  const rect = canvas.getBoundingClientRect();
  return [
    (event.clientX - rect.left) / (rect.width || 1),
    (event.clientY - rect.top) / (rect.height || 1),
  ];
}

// Pointer moves arrive at up to 120 Hz; batching keeps the data channel calm
// without a visible lag on the remote side.
const FLUSH_INTERVAL_MS = 50;
let pending: NormalizedPoint[] = [];
let flushTimer: number | undefined;

function flushPending(): void {
  if (flushTimer !== undefined) {
    window.clearTimeout(flushTimer);
    flushTimer = undefined;
  }
  if (!current || pending.length === 0) return;
  send({ type: 'append', id: current.id, points: pending });
  pending = [];
}

function queuePoint(point: NormalizedPoint): void {
  pending.push(point);
  if (flushTimer === undefined) {
    flushTimer = window.setTimeout(flushPending, FLUSH_INTERVAL_MS);
  }
}

function resizeCanvas(): void {
  dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(window.innerWidth * dpr));
  const height = Math.max(1, Math.round(window.innerHeight * dpr));
  if (canvas.width === width && canvas.height === height) return;
  canvas.width = width;
  canvas.height = height;
  redraw();
}

function toCanvasPoint(event: PointerEvent): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * dpr,
    y: (event.clientY - rect.top) * dpr,
  };
}

function strokeStyle(stroke: Stroke): void {
  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.globalAlpha = 1;
    ctx.lineWidth = 28 * dpr;
  } else if (stroke.tool === 'highlighter') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 22 * dpr;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.globalAlpha = 1;
    ctx.lineWidth = 3.5 * dpr;
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function drawStroke(stroke: Stroke): void {
  if (stroke.points.length === 0) return;
  strokeStyle(stroke);
  ctx.beginPath();
  const first = stroke.points[0];
  ctx.moveTo(first.x, first.y);
  if (stroke.points.length === 1) {
    ctx.lineTo(first.x + 0.01, first.y);
  } else {
    for (let i = 1; i < stroke.points.length; i += 1) {
      const prev = stroke.points[i - 1];
      const point = stroke.points[i];
      const midX = (prev.x + point.x) / 2;
      const midY = (prev.y + point.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    const last = stroke.points[stroke.points.length - 1];
    ctx.lineTo(last.x, last.y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

function redraw(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const stroke of strokes) {
    drawStroke(stroke);
  }
  if (current) drawStroke(current);
}

function applyCommand(command: AnnotateCommand): void {
  if (command.type === 'clear') {
    strokes.length = 0;
    current = null;
    pending = [];
    redraw();
    send({ type: 'clear' });
    return;
  }
  if (command.type === 'undo') {
    strokes.pop();
    current = null;
    pending = [];
    redraw();
    send({ type: 'undo' });
    return;
  }
  if (command.type === 'set-tool') {
    if (command.tool) tool = command.tool;
    if (command.color) color = command.color;
    canvas.style.cursor = tool === 'pointer' ? 'default' : 'crosshair';
  }
}

canvas.addEventListener('pointerdown', (event) => {
  if (!isDrawTool(tool) || event.button !== 0) return;
  event.preventDefault();
  canvas.setPointerCapture(event.pointerId);
  const drawTool = tool;
  current = {
    id: nextStrokeId(),
    tool: drawTool,
    color,
    points: [toCanvasPoint(event)],
  };
  pending = [];
  redraw();
  send({
    type: 'begin',
    stroke: {
      id: current.id,
      tool: drawTool,
      color,
      width: TOOL_WIDTH[drawTool] / (canvas.getBoundingClientRect().height || 1),
      points: [toNormalizedPoint(event)],
    },
  });
});

canvas.addEventListener('pointermove', (event) => {
  if (!current) return;
  current.points.push(toCanvasPoint(event));
  queuePoint(toNormalizedPoint(event));
  redraw();
});

function endStroke(event: PointerEvent): void {
  if (!current) return;
  current.points.push(toCanvasPoint(event));
  queuePoint(toNormalizedPoint(event));
  flushPending();
  const finished = current;
  strokes.push(current);
  current = null;
  try {
    canvas.releasePointerCapture(event.pointerId);
  } catch {
    // already released
  }
  redraw();
  send({ type: 'end', id: finished.id });
}

canvas.addEventListener('pointerup', endStroke);
canvas.addEventListener('pointercancel', endStroke);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

void listen<AnnotateCommand>('share-annotate-command', (event) => {
  applyCommand(event.payload);
});
