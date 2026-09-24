import { BrowserWindow, screen } from 'electron';
import { FLOATING_CONFERENCE, PIP_CHROME_HEIGHT, PRODUCT_NAME } from '../../shared/constants';
import { installWindowNavigationGuard } from '../navigation';
import { createWebPreferences } from './main-window';

const PIP_CHROME_HTML = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        height: 100%;
        background: #111318;
        color: #f4f4f5;
        font: 12px/1.2 ui-sans-serif, system-ui, sans-serif;
        user-select: none;
        overflow: hidden;
      }
      .bar {
        height: ${PIP_CHROME_HEIGHT}px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        gap: 8px;
        -webkit-app-region: drag;
        cursor: grab;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .title {
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      button {
        -webkit-app-region: no-drag;
        appearance: none;
        border: 0;
        border-radius: 8px;
        padding: 4px 8px;
        background: rgba(255,255,255,0.1);
        color: inherit;
        cursor: pointer;
      }
      button:hover {
        background: rgba(255,255,255,0.16);
      }
    </style>
  </head>
  <body>
    <div class="bar">
      <span class="title">Звонок</span>
      <button type="button" id="restore">Развернуть</button>
    </div>
  </body>
</html>`;

export function createFloatingConferenceWindow(): BrowserWindow {
  const display = screen.getPrimaryDisplay();
  const work = display.workArea;
  const width = FLOATING_CONFERENCE.width;
  const height = FLOATING_CONFERENCE.height;
  const window = new BrowserWindow({
    title: PRODUCT_NAME,
    width,
    height,
    minWidth: FLOATING_CONFERENCE.minWidth,
    minHeight: FLOATING_CONFERENCE.minHeight,
    x: work.x + work.width - width - 16,
    y: work.y + work.height - height - 16,
    show: false,
    frame: false,
    resizable: true,
    movable: true,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    fullscreenable: false,
    skipTaskbar: false,
    hasShadow: true,
    acceptFirstMouse: true,
    autoHideMenuBar: true,
    backgroundColor: '#111318',
    webPreferences: createWebPreferences('conference'),
  });

  window.setAlwaysOnTop(true, 'floating');
  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  installWindowNavigationGuard(window);
  void window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(PIP_CHROME_HTML)}`);
  window.webContents.on('did-finish-load', () => {
    void window.webContents.executeJavaScript(`
      document.getElementById('restore')?.addEventListener('click', () => {
        window.sovliumDesktop?.conference.exitFloatingMode();
      });
    `);
  });
  return window;
}

export function layoutFloatingConferenceView(
  window: BrowserWindow,
  setViewBounds: (bounds: { x: number; y: number; width: number; height: number }) => void,
): void {
  const [width, height] = window.getContentSize();
  setViewBounds({
    x: 0,
    y: PIP_CHROME_HEIGHT,
    width,
    height: Math.max(1, height - PIP_CHROME_HEIGHT),
  });
}
