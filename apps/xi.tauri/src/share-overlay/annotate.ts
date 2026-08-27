/**
 * Fullscreen transparent drawing surface for screen-share annotations.
 * Strokes live in this window so display capture includes them (Zoom-like).
 */

import { listen } from '@tauri-apps/api/event';

type Tool = 'pointer' | 'pen' | 'highlighter' | 'eraser';
type DrawTool = Exclude<Tool, 'pointer'>;

type AnnotateCommand = {
  type: string;
  tool?: Tool;
  color?: string;
};

type Point = { x: number; y: number };

type Stroke = {
  tool: DrawTool;
  color: string;
  points: Point[];
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
    redraw();
    return;
  }
  if (command.type === 'undo') {
    strokes.pop();
    current = null;
    redraw();
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
  current = {
    tool,
    color,
    points: [toCanvasPoint(event)],
  };
  redraw();
});

canvas.addEventListener('pointermove', (event) => {
  if (!current) return;
  current.points.push(toCanvasPoint(event));
  redraw();
});

function endStroke(event: PointerEvent): void {
  if (!current) return;
  current.points.push(toCanvasPoint(event));
  strokes.push(current);
  current = null;
  try {
    canvas.releasePointerCapture(event.pointerId);
  } catch {
    // already released
  }
  redraw();
}

canvas.addEventListener('pointerup', endStroke);
canvas.addEventListener('pointercancel', endStroke);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

void listen<AnnotateCommand>('share-annotate-command', (event) => {
  applyCommand(event.payload);
});
