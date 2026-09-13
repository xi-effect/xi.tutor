import { BrowserWindow, screen, session } from 'electron';
import { EVENTS } from '../../shared/channels';

let overlay: BrowserWindow | null = null;

const OVERLAY_STOP_URL = 'sovlium-overlay://stop';

const OVERLAY_HTML = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'"
    />
    <title>Sovlium</title>
    <style>
      html, body {
        margin: 0;
        height: 100%;
        font-family: Inter, system-ui, sans-serif;
        background: #111318;
        color: #f5f5f5;
        overflow: hidden;
        user-select: none;
      }
      .bar {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0 16px;
        box-sizing: border-box;
      }
      button {
        appearance: none;
        border: 0;
        border-radius: 10px;
        padding: 8px 12px;
        background: #e5484d;
        color: white;
        font-weight: 600;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div class="bar">
      <span>Вы демонстрируете экран</span>
      <button id="stop" type="button">Остановить</button>
    </div>
    <script>
      document.getElementById('stop').addEventListener('click', function () {
        location.href = ${JSON.stringify(OVERLAY_STOP_URL)};
      });
    </script>
  </body>
</html>`;

function positionOverlay(window: BrowserWindow): void {
  const display = screen.getPrimaryDisplay();
  const work = display.workArea;
  const width = 420;
  const height = 56;
  window.setBounds({
    x: Math.round(work.x + (work.width - width) / 2),
    y: work.y + 16,
    width,
    height,
  });
}

export function broadcastShareOverlayStop(): void {
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) {
      window.webContents.send(EVENTS.shareOverlayStop);
    }
  }
}

export function getShareOverlayWindow(): BrowserWindow | null {
  return overlay && !overlay.isDestroyed() ? overlay : null;
}

export function showShareOverlayWindow(): BrowserWindow {
  if (overlay && !overlay.isDestroyed()) {
    positionOverlay(overlay);
    overlay.showInactive();
    return overlay;
  }

  overlay = new BrowserWindow({
    width: 420,
    height: 56,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    fullscreenable: false,
    skipTaskbar: true,
    autoHideMenuBar: true,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      preload: undefined,
      session: session.fromPartition('sovlium-share-overlay'),
    },
  });

  overlay.setAlwaysOnTop(true, 'screen-saver');
  overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlay.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  overlay.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    if (url === OVERLAY_STOP_URL) {
      broadcastShareOverlayStop();
    }
  });
  overlay.on('closed', () => {
    overlay = null;
  });

  positionOverlay(overlay);
  void overlay.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(OVERLAY_HTML)}`);
  overlay.showInactive();
  return overlay;
}

export function hideShareOverlayWindow(): void {
  if (!overlay || overlay.isDestroyed()) return;
  overlay.hide();
}
