import { BrowserWindow, screen } from 'electron';
import { FLOATING_CONFERENCE } from '../shared/constants';

const CLOSE_URL = 'sovlium-pip://close';

const OVERLAY_HTML = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        height: 100%;
        background: transparent;
        overflow: hidden;
        user-select: none;
      }
      .card {
        box-sizing: border-box;
        height: 100%;
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        background: #1e1f22;
        color: #f2f3f5;
        font: 13px/1.3 ui-sans-serif, system-ui, sans-serif;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.08);
        -webkit-app-region: drag;
      }
      .header {
        height: 36px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 8px 0 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .title {
        opacity: 0.9;
        font-weight: 600;
      }
      .close {
        -webkit-app-region: no-drag;
        appearance: none;
        width: 24px;
        height: 24px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: inherit;
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
      }
      .close:hover {
        background: rgba(255, 255, 255, 0.12);
      }
      .body {
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.45);
        -webkit-app-region: drag;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <span class="title">Звонок</span>
        <button class="close" type="button" id="close" aria-label="Закрыть">×</button>
      </div>
      <div class="body">Плавающее окно</div>
    </div>
    <script>
      document.getElementById('close')?.addEventListener('click', function () {
        location.href = ${JSON.stringify(CLOSE_URL)};
      });
    </script>
  </body>
</html>`;

let overlay: BrowserWindow | null = null;
let onClosed: (() => void) | null = null;

export function setCallPipClosedListener(listener: (() => void) | null): void {
  onClosed = listener;
}

export function isCallPipActive(): boolean {
  return Boolean(overlay && !overlay.isDestroyed() && overlay.isVisible());
}

function clampSize(width: number, height: number): { width: number; height: number } {
  return {
    width: Math.max(FLOATING_CONFERENCE.minWidth, Math.round(width)),
    height: Math.max(FLOATING_CONFERENCE.minHeight, Math.round(height)),
  };
}

function bottomRight(width: number, height: number): { x: number; y: number } {
  const work = screen.getPrimaryDisplay().workArea;
  return {
    x: Math.round(work.x + work.width - width - 16),
    y: Math.round(work.y + work.height - height - 16),
  };
}

function pin(window: BrowserWindow): void {
  window.setAlwaysOnTop(true, 'floating');
  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
}

function notifyClosed(): void {
  overlay = null;
  onClosed?.();
}

export function enterCallPip(size?: {
  width: number;
  height: number;
}): { width: number; height: number } {
  const next = clampSize(
    size?.width ?? FLOATING_CONFERENCE.width,
    size?.height ?? FLOATING_CONFERENCE.height,
  );

  if (overlay && !overlay.isDestroyed()) {
    overlay.setContentSize(next.width, next.height);
    pin(overlay);
    overlay.show();
    overlay.focus();
    const [width, height] = overlay.getContentSize();
    return { width, height };
  }

  const position = bottomRight(next.width, next.height);
  overlay = new BrowserWindow({
    width: next.width,
    height: next.height,
    minWidth: FLOATING_CONFERENCE.minWidth,
    minHeight: FLOATING_CONFERENCE.minHeight,
    x: position.x,
    y: position.y,
    show: false,
    frame: false,
    transparent: true,
    resizable: true,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: true,
    acceptFirstMouse: true,
    autoHideMenuBar: true,
    backgroundColor: '#00000000',
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  pin(overlay);
  overlay.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  overlay.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    if (url === CLOSE_URL) {
      leaveCallPip();
    }
  });
  overlay.on('closed', () => {
    if (overlay) notifyClosed();
  });

  void overlay.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(OVERLAY_HTML)}`);
  overlay.once('ready-to-show', () => {
    if (!overlay || overlay.isDestroyed()) return;
    pin(overlay);
    overlay.show();
    overlay.focus();
  });

  return next;
}

export function leaveCallPip(): void {
  const window = overlay;
  overlay = null;
  if (!window || window.isDestroyed()) return;
  window.removeAllListeners('closed');
  window.close();
  onClosed?.();
}

export function resizeCallPip(size: {
  width: number;
  height: number;
}): { width: number; height: number } {
  if (!overlay || overlay.isDestroyed()) return size;
  const next = clampSize(size.width, size.height);
  overlay.setContentSize(next.width, next.height);
  pin(overlay);
  const [width, height] = overlay.getContentSize();
  return { width, height };
}
