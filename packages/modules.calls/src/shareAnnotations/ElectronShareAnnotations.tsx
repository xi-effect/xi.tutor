/**
 * Zoom-like annotations while sharing the screen from the Electron shell.
 *
 * Two popups are opened from this renderer (see apps/xi.electron/src/main/share-annotations.ts):
 * a transparent canvas over the shared display — captured together with the
 * screen, so remote participants see the strokes right in the share video — and
 * a floating toolbar. Both are rendered from here through portals, so the stop
 * button talks to LiveKit directly.
 */

import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { useLocalParticipant, useRemoteParticipants } from '@livekit/components-react';
import { Brush, Close, Conference, Cursor, Eraser, Laptop, Pen, Trash, Undo } from '@xipkg/icons';
import { Track } from 'livekit-client';
import {
  SHARE_ANNOTATION_CANVAS_FRAME_NAME,
  SHARE_ANNOTATION_TOOLBAR_FRAME_NAME,
  SHARE_ANNOTATION_TOOLBAR_SIZE,
  focusAppWindow,
  getLastShareSource,
  isElectronShell,
  layoutShareAnnotations,
  setShareAnnotationDrawing,
  setShareToolbarSize,
  type ShareCaptureSize,
} from 'common.platform';
import {
  useRemoteControlHost,
  type RemoteControlHost,
} from '../remoteControl/useRemoteControlHost';

type Tool = 'pointer' | 'pen' | 'highlighter' | 'eraser';
type DrawTool = Exclude<Tool, 'pointer'>;

type Point = { x: number; y: number };
type Stroke = { tool: DrawTool; color: string; points: Point[] };

type CanvasHandle = { undo(): void; clear(): void };

type Popups = { canvas: Window; toolbar: Window };

/**
 * macOS passes clicks through fully transparent pixels even when the window
 * accepts mouse events; ~1% alpha is invisible on screen and in the capture.
 */
const DRAWING_BACKDROP = 'rgba(0, 0, 0, 0.012)';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#f8fafc'];

/** Line widths in CSS pixels of the shared display. */
const TOOL_WIDTH: Record<DrawTool, number> = {
  pen: 4,
  highlighter: 22,
  eraser: 28,
};

const TOOLS: Array<{ id: Tool; label: string; shortcut: string; Icon: typeof Pen }> = [
  { id: 'pointer', label: 'Курсор — клики проходят в приложения', shortcut: 'V', Icon: Cursor },
  { id: 'pen', label: 'Перо', shortcut: 'P', Icon: Pen },
  { id: 'highlighter', label: 'Маркер', shortcut: 'H', Icon: Brush },
  { id: 'eraser', label: 'Ластик', shortcut: 'E', Icon: Eraser },
];

/** Physical keys, so the shortcuts stay put on a Russian layout. */
const TOOL_BY_CODE: Record<string, Tool> = {
  KeyV: 'pointer',
  KeyP: 'pen',
  KeyH: 'highlighter',
  KeyE: 'eraser',
};

const UNDO_SHORTCUT = /mac/i.test(navigator.platform) ? '⌘Z' : 'Ctrl+Z';

type AnnotationShortcut =
  { type: 'tool'; tool: Tool } | { type: 'color'; index: number } | { type: 'undo' };

function annotationShortcut(event: KeyboardEvent): AnnotationShortcut | null {
  // The event comes from a popup window, so its elements are not `instanceof` this realm's HTMLElement.
  const target = event.target as { tagName?: string; isContentEditable?: boolean } | null;
  const tag = target?.tagName;
  if (target?.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA') return null;
  const command = event.metaKey || event.ctrlKey;
  if (command && !event.altKey && event.code === 'KeyZ' && !event.shiftKey) return { type: 'undo' };
  if (command || event.altKey || event.metaKey) return null;
  if (event.key === 'Escape') return { type: 'tool', tool: 'pointer' };
  const tool = TOOL_BY_CODE[event.code];
  if (tool) return { type: 'tool', tool };
  const digit = /^Digit([1-6])$/.exec(event.code);
  if (digit) return { type: 'color', index: Number(digit[1]) - 1 };
  return null;
}

const CANVAS_CSS = `
html, body {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent !important;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}
`;

const TOOLBAR_CSS = `
html, body {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent !important;
  font-family: Inter, system-ui, -apple-system, sans-serif;
  user-select: none;
  -webkit-user-select: none;
}
.bar {
  box-sizing: border-box;
  position: absolute;
  top: 4px;
  left: 4px;
  width: max-content;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px 0 8px;
  border-radius: 14px;
  background: rgba(22, 26, 34, 0.94);
  color: #f4f6fa;
  border: 1px solid rgba(255, 255, 255, 0.08);
  -webkit-app-region: drag;
}
.bar *, .bar *::before, .bar *::after { box-sizing: border-box; }
.bar button { -webkit-app-region: no-drag; }
.pulse {
  width: 8px;
  height: 8px;
  margin: 0 2px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
  animation: pulse 1.6s ease-out infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.55); }
  70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
.divider { width: 1px; height: 20px; background: rgba(255, 255, 255, 0.12); flex-shrink: 0; }
.group { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.icon {
  appearance: none;
  border: 0;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: rgba(244, 246, 250, 0.88);
  cursor: pointer;
  flex-shrink: 0;
}
.icon:hover, .swatch:hover { background: rgba(255, 255, 255, 0.12); }
.icon.active { background: rgba(92, 95, 209, 0.9); color: #fff; }
.icon:disabled, .swatch:disabled { opacity: 0.35; cursor: default; background: transparent; }
.swatch {
  appearance: none;
  border: 2px solid transparent;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  padding: 0;
  background: var(--swatch);
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
}
.swatch.active { border-color: #fff; }
.icon svg { width: 16px; height: 16px; fill: currentColor; }
.icon.danger:hover { background: #dc2626; color: #fff; }
.icon.live { background: #16a34a; color: #fff; }
.panel {
  box-sizing: border-box;
  position: absolute;
  top: 52px;
  left: 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(22, 26, 34, 0.96);
  color: #f4f6fa;
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 13px;
  line-height: 18px;
}
.panel *, .panel *::before, .panel *::after { box-sizing: border-box; }
.panel.strip { flex-direction: row; align-items: center; padding: 6px 6px 6px 12px; }
.panel-title { font-weight: 600; }
.panel-text { color: rgba(244, 246, 250, 0.7); font-size: 12px; }
.panel-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.panel-grow { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.panel-actions { display: flex; justify-content: flex-end; gap: 8px; flex-shrink: 0; }
.list { display: flex; flex-direction: column; gap: 2px; max-height: 240px; overflow-y: auto; }
.person { display: flex; align-items: center; gap: 8px; padding: 4px 4px 4px 8px; border-radius: 8px; }
.person:hover { background: rgba(255, 255, 255, 0.06); }
.btn {
  appearance: none;
  border: 0;
  border-radius: 8px;
  padding: 6px 12px;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  color: #f4f6fa;
  flex-shrink: 0;
}
.btn:hover { background: rgba(255, 255, 255, 0.18); }
.btn.primary { background: rgb(92, 95, 209); color: #fff; }
.btn.primary:hover { background: rgb(76, 79, 192); }
.btn.danger { background: #dc2626; color: #fff; }
.btn.danger:hover { background: #b91c1c; }
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
`;

function isDrawTool(tool: Tool): tool is DrawTool {
  return tool !== 'pointer';
}

function openPopup(frameName: string, features: string, title: string, css: string): Window | null {
  const popup = window.open('', `${frameName}-${Date.now().toString(36)}`, features);
  if (!popup) return null;
  const doc = popup.document;
  doc.title = title;
  const style = doc.createElement('style');
  style.textContent = css;
  doc.head.appendChild(style);
  return popup;
}

function openPopups(): Popups | null {
  const { availWidth, width, height } = window.screen;
  const screenArea = window.screen as Screen & { availLeft?: number; availTop?: number };
  const left = screenArea.availLeft ?? 0;
  const top = screenArea.availTop ?? 0;

  const canvas = openPopup(
    SHARE_ANNOTATION_CANVAS_FRAME_NAME,
    `popup,left=${left},top=${top},width=${width},height=${height}`,
    'Sovlium — рисование',
    CANVAS_CSS,
  );
  if (!canvas) return null;

  const bar = SHARE_ANNOTATION_TOOLBAR_SIZE;
  const toolbar = openPopup(
    SHARE_ANNOTATION_TOOLBAR_FRAME_NAME,
    `popup,left=${Math.round(left + (availWidth - bar.width) / 2)},top=${top + 16},width=${bar.width},height=${bar.height}`,
    'Sovlium — демонстрация',
    TOOLBAR_CSS,
  );
  if (!toolbar) {
    canvas.close();
    return null;
  }
  return { canvas, toolbar };
}

function useAnnotationPopups(active: boolean): Popups | null {
  const [popups, setPopups] = useState<Popups | null>(null);

  useEffect(() => {
    if (!active) return;
    const next = openPopups();
    if (!next) {
      console.warn('[modules.calls] share annotation windows were blocked');
      return;
    }
    setPopups(next);
    const closeAll = () => {
      next.canvas.close();
      next.toolbar.close();
    };
    window.addEventListener('pagehide', closeAll);
    return () => {
      window.removeEventListener('pagehide', closeAll);
      closeAll();
      setPopups(null);
    };
  }, [active]);

  return popups;
}

function readCaptureSize(track: MediaStreamTrack | undefined): ShareCaptureSize | null {
  const settings = track?.getSettings();
  const width = settings?.width ?? 0;
  const height = settings?.height ?? 0;
  return width > 0 && height > 0 ? { width, height } : null;
}

function strokeStyle(ctx: CanvasRenderingContext2D, stroke: Stroke, dpr: number): void {
  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.globalAlpha = 1;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.globalAlpha = stroke.tool === 'highlighter' ? 0.35 : 1;
  }
  ctx.lineWidth = TOOL_WIDTH[stroke.tool] * dpr;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, dpr: number): void {
  const { points } = stroke;
  if (points.length === 0) return;
  strokeStyle(ctx, stroke, dpr);
  ctx.beginPath();
  ctx.moveTo(points[0].x * dpr, points[0].y * dpr);
  if (points.length === 1) {
    ctx.lineTo(points[0].x * dpr + 0.01, points[0].y * dpr);
  } else {
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const point = points[i];
      ctx.quadraticCurveTo(
        prev.x * dpr,
        prev.y * dpr,
        ((prev.x + point.x) / 2) * dpr,
        ((prev.y + point.y) / 2) * dpr,
      );
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x * dpr, last.y * dpr);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

type CanvasProps = {
  popup: Window;
  tool: Tool;
  color: string;
  ref: Ref<CanvasHandle>;
};

function AnnotationCanvas({ popup, tool, color, ref }: CanvasProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const frame = useRef<number | undefined>(undefined);

  const redraw = () => {
    frame.current = undefined;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = popup.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokes.current) drawStroke(ctx, stroke, dpr);
    if (current.current) drawStroke(ctx, current.current, dpr);
  };
  const redrawRef = useRef(redraw);
  redrawRef.current = redraw;

  const scheduleRedraw = () => {
    if (frame.current === undefined) {
      frame.current = popup.requestAnimationFrame(() => redrawRef.current());
    }
  };

  useImperativeHandle(ref, () => ({
    undo() {
      strokes.current = strokes.current.slice(0, -1);
      current.current = null;
      redrawRef.current();
    },
    clear() {
      strokes.current = [];
      current.current = null;
      redrawRef.current();
    },
  }));

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = popup.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(popup.innerWidth * dpr));
      const height = Math.max(1, Math.round(popup.innerHeight * dpr));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
      redrawRef.current();
    };
    resize();
    popup.addEventListener('resize', resize);
    return () => {
      popup.removeEventListener('resize', resize);
      if (frame.current !== undefined) popup.cancelAnimationFrame(frame.current);
    };
  }, [popup]);

  const pointFrom = (event: PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const finish = (event: PointerEvent<HTMLCanvasElement>) => {
    const stroke = current.current;
    if (!stroke) return;
    stroke.points.push(pointFrom(event));
    strokes.current = [...strokes.current, stroke];
    current.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
    scheduleRedraw();
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        cursor: isDrawTool(tool) ? 'crosshair' : 'default',
        background: isDrawTool(tool) ? DRAWING_BACKDROP : 'transparent',
      }}
      onPointerDown={(event) => {
        if (!isDrawTool(tool) || event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        current.current = { tool, color, points: [pointFrom(event)] };
        scheduleRedraw();
      }}
      onPointerMove={(event) => {
        if (!current.current) return;
        current.current.points.push(pointFrom(event));
        scheduleRedraw();
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
    />
  );
}

type ToolbarProps = {
  tool: Tool;
  color: string;
  onTool(tool: Tool): void;
  onColor(color: string): void;
  onUndo(): void;
  onClear(): void;
  onStop(): void;
  /** `false` for a single-window share: the canvas is not part of that capture. */
  canDraw: boolean;
  /** Drawing is off while someone else controls the screen. */
  drawLocked: boolean;
  remote: RemoteControlHost;
  remoteAvailable: boolean;
  people: Person[];
};

type Person = { identity: string; name: string };

const WINDOW_SHARE_HINT = 'Рисовать можно при демонстрации всего экрана';
const CONTROL_LOCK_HINT = 'Рисование недоступно, пока экраном управляет участник';
/** Gap between the bar and the panel under it. */
const PANEL_OFFSET_PX = 52;
const PANEL_BOTTOM_PADDING_PX = 4;

function nameOf(people: Person[], identity: string): string {
  return people.find((person) => person.identity === identity)?.name ?? identity;
}

type PanelProps = {
  remote: RemoteControlHost;
  people: Person[];
  menuOpen: boolean;
  onCloseMenu(): void;
};

function RemoteControlPanel({
  remote,
  people,
  menuOpen,
  onCloseMenu,
}: PanelProps): ReactElement | null {
  const { status, controller, pending } = remote;

  if (pending) {
    return (
      <div className="panel" role="alertdialog" aria-label="Запрос управления">
        <div className="panel-title">{nameOf(people, pending)} просит управление компьютером</div>
        <div className="panel-text">
          Участник сможет двигать курсор, кликать и печатать на этом экране. Забрать управление
          можно в любой момент.
        </div>
        <div className="panel-actions">
          <button type="button" className="btn" onClick={remote.deny}>
            Отклонить
          </button>
          <button type="button" className="btn primary" onClick={() => remote.grant(pending)}>
            Разрешить
          </button>
        </div>
      </div>
    );
  }

  if (controller && !menuOpen) {
    return (
      <div className="panel strip" role="status">
        <div className="live-dot" aria-hidden="true" />
        <div className="panel-grow">Управляет {nameOf(people, controller)}</div>
        <button type="button" className="btn danger" onClick={remote.revoke}>
          Забрать управление
        </button>
      </div>
    );
  }

  if (!menuOpen) return null;

  if (!status) {
    return (
      <div className="panel">
        <div className="panel-text">Проверяем доступ…</div>
      </div>
    );
  }

  if (!status.supported) {
    return (
      <div className="panel">
        <div className="panel-title">Управление недоступно</div>
        <div className="panel-text">
          Передать управление можно только из приложения для macOS и Windows.
        </div>
      </div>
    );
  }

  if (!status.trusted) {
    return (
      <div className="panel">
        <div className="panel-title">Нужно разрешение macOS</div>
        <div className="panel-text">
          Включите Sovlium в «Системные настройки → Конфиденциальность и безопасность →
          Универсальный доступ». Панель обновится сама.
        </div>
        <div className="panel-actions">
          <button type="button" className="btn primary" onClick={remote.requestAccess}>
            Открыть настройки
          </button>
        </div>
      </div>
    );
  }

  if (controller) {
    return (
      <div className="panel">
        <div className="panel-row">
          <div className="live-dot" aria-hidden="true" />
          <div className="panel-grow">Управляет {nameOf(people, controller)}</div>
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              remote.revoke();
              onCloseMenu();
            }}
          >
            Забрать управление
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-title">Передать управление компьютером</div>
      {people.length === 0 ? (
        <div className="panel-text">В звонке пока нет других участников.</div>
      ) : (
        <div className="list">
          {people.map((person) => (
            <div key={person.identity} className="person">
              <div className="panel-grow">{person.name}</div>
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  remote.grant(person.identity);
                  onCloseMenu();
                }}
              >
                Передать
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnnotationToolbar({
  tool,
  color,
  onTool,
  onColor,
  onUndo,
  onClear,
  onStop,
  canDraw,
  drawLocked,
  remote,
  remoteAvailable,
  people,
}: ToolbarProps): ReactElement {
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastSize = useRef({ width: 0, height: 0 });
  const drawEnabled = canDraw && !drawLocked;
  const drawHint = canDraw ? CONTROL_LOCK_HINT : WINDOW_SHARE_HINT;

  useEffect(() => {
    if (!remoteAvailable) setMenuOpen(false);
  }, [remoteAvailable]);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const panel = panelRef.current?.firstElementChild as HTMLElement | null;
    // The panel follows the bar, so the window is exactly as wide as the tools.
    if (panel) panel.style.width = `${bar.offsetWidth}px`;
    const width = bar.offsetWidth + PANEL_BOTTOM_PADDING_PX * 2;
    const height = panel
      ? PANEL_OFFSET_PX + panel.offsetHeight + PANEL_BOTTOM_PADDING_PX
      : SHARE_ANNOTATION_TOOLBAR_SIZE.height;
    if (width === lastSize.current.width && height === lastSize.current.height) return;
    lastSize.current = { width, height };
    void setShareToolbarSize({ width, height }).catch((err) => {
      console.warn('[modules.calls] share toolbar resize failed', err);
    });
  });

  const controllerName = remote.controller ? nameOf(people, remote.controller) : null;

  return (
    <>
      <div ref={barRef} className="bar" role="toolbar" aria-label="Демонстрация экрана">
        <div
          className="pulse"
          aria-hidden="true"
          title={canDraw ? 'Демонстрация экрана' : 'Демонстрация окна'}
        />
        <div className="divider" aria-hidden="true" />
        <div className="group">
          {TOOLS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tool === item.id ? 'icon active' : 'icon'}
              title={
                drawEnabled || item.id === 'pointer' ? `${item.label} (${item.shortcut})` : drawHint
              }
              aria-label={item.label}
              aria-pressed={tool === item.id}
              disabled={!drawEnabled && item.id !== 'pointer'}
              onClick={() => onTool(item.id)}
            >
              <item.Icon />
            </button>
          ))}
        </div>
        <div className="group" role="group" aria-label="Цвет">
          {COLORS.map((value, index) => (
            <button
              key={value}
              type="button"
              className={color === value && tool !== 'eraser' ? 'swatch active' : 'swatch'}
              style={{ ['--swatch' as string]: value }}
              title={drawEnabled ? `Цвет (${index + 1})` : drawHint}
              aria-label={`Цвет ${value}`}
              disabled={!drawEnabled}
              onClick={() => onColor(value)}
            />
          ))}
        </div>
        <div className="group">
          <button
            type="button"
            className="icon"
            title={`Отменить (${UNDO_SHORTCUT})`}
            aria-label="Отменить"
            disabled={!canDraw}
            onClick={onUndo}
          >
            <Undo />
          </button>
          <button
            type="button"
            className="icon"
            title="Очистить"
            aria-label="Очистить"
            disabled={!canDraw}
            onClick={onClear}
          >
            <Trash />
          </button>
        </div>
        <div className="divider" aria-hidden="true" />
        <div className="group">
          {remoteAvailable ? (
            <button
              type="button"
              className={remote.controller ? 'icon live' : menuOpen ? 'icon active' : 'icon'}
              title={
                controllerName ? `Управляет ${controllerName}` : 'Передать управление компьютером'
              }
              aria-label="Передать управление компьютером"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Laptop />
            </button>
          ) : null}
          <button
            type="button"
            className="icon"
            title="Вернуться в звонок"
            aria-label="Вернуться в звонок"
            onClick={() => void focusAppWindow()}
          >
            <Conference />
          </button>
          <button
            type="button"
            className="icon danger"
            title="Остановить демонстрацию"
            aria-label="Остановить демонстрацию"
            onClick={onStop}
          >
            <Close />
          </button>
        </div>
      </div>
      <div ref={panelRef}>
        {remoteAvailable ? (
          <RemoteControlPanel
            remote={remote}
            people={people}
            menuOpen={menuOpen}
            onCloseMenu={() => setMenuOpen(false)}
          />
        ) : null}
      </div>
    </>
  );
}

export function ElectronShareAnnotations(): ReactElement | null {
  const { isScreenShareEnabled, localParticipant } = useLocalParticipant();
  const popups = useAnnotationPopups(isElectronShell() && isScreenShareEnabled);
  const canvasHandle = useRef<CanvasHandle>(null);
  const [tool, setTool] = useState<Tool>('pointer');
  const [color, setColor] = useState(COLORS[0]);
  const [captureWidth, setCaptureWidth] = useState(0);
  const [captureHeight, setCaptureHeight] = useState(0);

  const track = localParticipant.getTrackPublication(Track.Source.ScreenShare)?.track
    ?.mediaStreamTrack;

  useEffect(() => {
    if (!popups) return;
    const sync = () => {
      const size = readCaptureSize(track);
      setCaptureWidth(size?.width ?? 0);
      setCaptureHeight(size?.height ?? 0);
    };
    sync();
    // The first settings can arrive before the capturer reports the real size.
    const timer = window.setTimeout(sync, 1000);
    return () => window.clearTimeout(timer);
  }, [popups, track]);

  useEffect(() => {
    if (!popups) return;
    const size = captureWidth > 0 ? { width: captureWidth, height: captureHeight } : null;
    void layoutShareAnnotations(size).catch((err) => {
      console.warn('[modules.calls] share annotation layout failed', err);
    });
  }, [popups, captureWidth, captureHeight]);

  const canDraw = getLastShareSource()?.kind !== 'window';
  // Normalized coordinates only map onto a whole display.
  const remote = useRemoteControlHost(Boolean(popups) && canDraw);
  const remoteAvailable = Boolean(popups) && canDraw && Boolean(remote.status?.supported);
  const remoteParticipants = useRemoteParticipants();
  const people = remoteParticipants.map((participant) => ({
    identity: participant.identity,
    name: participant.name || participant.identity,
  }));
  const drawLocked = remote.controller !== null;

  useEffect(() => {
    // Injected clicks would otherwise land on the canvas and draw.
    if (drawLocked) setTool('pointer');
  }, [drawLocked]);

  const drawing = Boolean(popups) && canDraw && !drawLocked && isDrawTool(tool);
  useEffect(() => {
    if (!popups) return;
    void setShareAnnotationDrawing(drawing).catch((err) => {
      console.warn('[modules.calls] share annotation click-through failed', err);
    });
  }, [popups, drawing]);

  useEffect(() => {
    if (popups) return;
    setTool('pointer');
  }, [popups]);

  useEffect(() => {
    if (!popups || !canDraw) return;
    const onKey = (event: KeyboardEvent) => {
      const shortcut = annotationShortcut(event);
      if (!shortcut || (event.repeat && shortcut.type !== 'undo')) return;
      if (shortcut.type === 'undo') {
        event.preventDefault();
        canvasHandle.current?.undo();
        return;
      }
      if (drawLocked) return;
      event.preventDefault();
      if (shortcut.type === 'tool') {
        setTool(shortcut.tool);
        return;
      }
      setColor(COLORS[shortcut.index]);
      setTool((current) => (current === 'pointer' || current === 'eraser' ? 'pen' : current));
    };
    for (const popup of [popups.canvas, popups.toolbar]) {
      popup.addEventListener('keydown', onKey);
    }
    return () => {
      for (const popup of [popups.canvas, popups.toolbar]) {
        popup.removeEventListener('keydown', onKey);
      }
    };
  }, [popups, canDraw, drawLocked]);

  if (!popups) return null;

  return (
    <>
      {createPortal(
        <AnnotationCanvas ref={canvasHandle} popup={popups.canvas} tool={tool} color={color} />,
        popups.canvas.document.body,
      )}
      {createPortal(
        <AnnotationToolbar
          tool={tool}
          color={color}
          canDraw={canDraw}
          drawLocked={drawLocked}
          remote={remote}
          remoteAvailable={remoteAvailable}
          people={people}
          onTool={setTool}
          onColor={(next) => {
            setColor(next);
            if (tool === 'pointer' || tool === 'eraser') setTool('pen');
          }}
          onUndo={() => canvasHandle.current?.undo()}
          onClear={() => canvasHandle.current?.clear()}
          onStop={() => {
            void localParticipant.setScreenShareEnabled(false).catch((err) => {
              console.error('[modules.calls] failed to stop screen share from toolbar', err);
            });
          }}
        />,
        popups.toolbar.document.body,
      )}
    </>
  );
}
