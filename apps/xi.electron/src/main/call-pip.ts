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
    // NSPanel: floats over other apps' full-screen Spaces without activating Sovlium.
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

export function configureCallOverlayWindow(window: BrowserWindow): void {
  const pin = () => {
    if (window.isDestroyed()) return;
    window.setAlwaysOnTop(true, 'screen-saver');
    window.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
      skipTransformProcessType: true,
    });
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
  window.on('show', pin);
  window.on('resize', keepOnScreen);
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });
}
