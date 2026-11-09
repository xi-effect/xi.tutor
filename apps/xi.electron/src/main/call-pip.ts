import {
  screen,
  type BrowserWindow,
  type BrowserWindowConstructorOptions,
  type HandlerDetails,
  type WindowOpenHandlerResponse,
} from 'electron';
import { CALL_OVERLAY_FRAME_NAME, FLOATING_CONFERENCE } from '../shared/constants';

/** CompactView audio-only layout: 60px chrome + 48px bar + 32px title bar. */
const OVERLAY_MIN_HEIGHT_PX = 140;

let overlayWindow: BrowserWindow | null = null;

export function isCallOverlayRequest(details: { url: string; frameName: string }): boolean {
  if (details.frameName !== CALL_OVERLAY_FRAME_NAME) return false;
  return details.url === '' || details.url === 'about:blank';
}

/** Position and size come from the `window.open` features (left/top/width/height). */
function overlayOptions(): BrowserWindowConstructorOptions {
  return {
    title: 'Звонок',
    minWidth: FLOATING_CONFERENCE.minWidth,
    minHeight: OVERLAY_MIN_HEIGHT_PX,
    frame: false,
    resizable: true,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hiddenInMissionControl: true,
    alwaysOnTop: true,
    hasShadow: true,
    roundedCorners: true,
    acceptFirstMouse: true,
    autoHideMenuBar: true,
    backgroundColor: '#1e1f22',
    // Frameless Windows windows paint black and can take down the GPU process
    // when Chromium resizes them, unless the thick frame stays on.
    ...(process.platform === 'win32' ? { thickFrame: true } : {}),
    // NSPanel: floats over other apps' full-screen Spaces without activating the app.
    ...(process.platform === 'darwin' ? { type: 'panel' } : {}),
  };
}

/**
 * The call overlay is a same-origin `window.open('')` popup: CompactView renders
 * its PiP UI into it through a React portal, so LiveKit video elements keep
 * playing from the opener's MediaStreams (same approach as Discord pop-outs).
 */
export function callOverlayWindowOpen(details: HandlerDetails): WindowOpenHandlerResponse | null {
  if (!isCallOverlayRequest(details)) return null;
  return { action: 'allow', overrideBrowserWindowOptions: overlayOptions() };
}

/**
 * CompactView asks for a new size when the chat opens. `window.resizeTo` from
 * the renderer paints a frameless Windows window black and can crash the app,
 * so the size is applied here and kept inside the work area.
 */
export function resizeCallOverlay(width: number, height: number): void {
  const overlay = overlayWindow;
  if (!overlay || overlay.isDestroyed()) return;
  if (width < 50 || height < 50) return;

  const area = screen.getDisplayMatching(overlay.getBounds()).workArea;
  const nextWidth = Math.round(Math.min(Math.max(width, FLOATING_CONFERENCE.minWidth), area.width));
  const nextHeight = Math.round(Math.min(Math.max(height, OVERLAY_MIN_HEIGHT_PX), area.height));
  const bounds = overlay.getBounds();
  let x = bounds.x;
  let y = bounds.y;
  if (x + nextWidth > area.x + area.width) x = area.x + area.width - nextWidth;
  if (y + nextHeight > area.y + area.height) y = area.y + area.height - nextHeight;
  x = Math.round(Math.max(area.x, x));
  y = Math.round(Math.max(area.y, y));
  if (
    bounds.x === x &&
    bounds.y === y &&
    bounds.width === nextWidth &&
    bounds.height === nextHeight
  ) {
    return;
  }
  overlay.setBounds({ x, y, width: nextWidth, height: nextHeight });
  if (process.platform === 'win32') overlay.setBackgroundColor('#1e1f22');
}

export function configureCallOverlayWindow(window: BrowserWindow): void {
  overlayWindow = window;
  const pin = () => {
    if (window.isDestroyed()) return;
    window.setAlwaysOnTop(true, 'screen-saver');
    if (process.platform === 'darwin') {
      window.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true,
        skipTransformProcessType: true,
      });
    } else {
      window.setVisibleOnAllWorkspaces(true);
    }
  };

  // CompactView grows the window downward (resizeTo) when switching layouts.
  const keepOnScreen = () => {
    if (window.isDestroyed()) return;
    const bounds = window.getBounds();
    const area = screen.getDisplayMatching(bounds).workArea;
    const x = Math.min(Math.max(bounds.x, area.x), area.x + area.width - bounds.width);
    const y = Math.min(Math.max(bounds.y, area.y), area.y + area.height - bounds.height);
    if (x !== bounds.x || y !== bounds.y) window.setPosition(Math.round(x), Math.round(y));
  };

  pin();
  window.on('closed', () => {
    if (overlayWindow === window) overlayWindow = null;
  });
  window.on('show', pin);
  window.on('resize', keepOnScreen);
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });
}
