import {
  screen,
  type BrowserWindow,
  type BrowserWindowConstructorOptions,
  type Display,
  type HandlerDetails,
  type Rectangle,
  type WindowOpenHandlerResponse,
} from 'electron';
import type { ShareCaptureSize } from '../shared/types';
import {
  SHARE_ANNOTATION_CANVAS_FRAME_NAME,
  SHARE_ANNOTATION_TOOLBAR_FRAME_NAME,
  SHARE_ANNOTATION_TOOLBAR_LIMITS,
  SHARE_ANNOTATION_TOOLBAR_SIZE,
} from '../shared/constants';

/**
 * Zoom-like screen-share annotations, desktop Electron.
 *
 * The call renderer opens two same-origin `window.open('')` popups and renders
 * into them itself:
 * - canvas — transparent, covers the shared display and is captured with it,
 *   so remote participants see strokes directly in the screen-share video;
 * - toolbar — tools / stop controls, excluded from capture where the OS allows.
 */

type AnnotationWindowKind = 'canvas' | 'toolbar';

const TOOLBAR_TOP_OFFSET_PX = 16;

const windows: Partial<Record<AnnotationWindowKind, BrowserWindow>> = {};
let sharedDisplayId: string | null = null;
let captureSize: ShareCaptureSize | null = null;
let drawing = false;
let ownerBounds: Rectangle | null = null;
let toolbarWidth: number = SHARE_ANNOTATION_TOOLBAR_SIZE.width;
let toolbarHeight: number = SHARE_ANNOTATION_TOOLBAR_SIZE.height;

function kindOf(details: { url: string; frameName: string }): AnnotationWindowKind | null {
  if (details.url !== '' && details.url !== 'about:blank') return null;
  // Names carry a per-open suffix so a reopen never reuses a window that is still closing.
  if (details.frameName.startsWith(SHARE_ANNOTATION_CANVAS_FRAME_NAME)) return 'canvas';
  if (details.frameName.startsWith(SHARE_ANNOTATION_TOOLBAR_FRAME_NAME)) return 'toolbar';
  return null;
}

function alive(kind: AnnotationWindowKind): BrowserWindow | null {
  const window = windows[kind];
  return window && !window.isDestroyed() ? window : null;
}

/** Display id reported by `desktopCapturer` when the shell picked the source itself. */
export function rememberSharedDisplay(displayId: string | undefined): void {
  sharedDisplayId = displayId ? String(displayId) : null;
}

function physicalSize(display: Display): ShareCaptureSize {
  return {
    width: Math.round(display.size.width * display.scaleFactor),
    height: Math.round(display.size.height * display.scaleFactor),
  };
}

/**
 * The macOS system picker does not tell the shell which display was chosen, so
 * it is matched by the captured track size (aspect ratio survives LiveKit's
 * downscaling), falling back to the display the call window is on.
 */
export function sharedDisplay(): Display {
  const displays = screen.getAllDisplays();
  const byId = sharedDisplayId ? displays.find((d) => String(d.id) === sharedDisplayId) : undefined;
  if (byId) return byId;

  const owner = ownerBounds ? screen.getDisplayMatching(ownerBounds) : screen.getPrimaryDisplay();
  if (!captureSize || displays.length < 2) return owner;

  const { width, height } = captureSize;
  const exact = displays.find((d) => {
    const size = physicalSize(d);
    return size.width === width && size.height === height;
  });
  if (exact) return exact;

  const ratio = width / height;
  const sameRatio = displays.filter((d) => Math.abs(d.size.width / d.size.height - ratio) < 0.01);
  if (sameRatio.some((d) => d.id === owner.id)) return owner;
  return sameRatio[0] ?? owner;
}

function pin(window: BrowserWindow, level: 'pop-up-menu' | 'screen-saver'): void {
  window.setAlwaysOnTop(true, level);
  window.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
    skipTransformProcessType: true,
  });
}

function applyDrawing(): void {
  const canvas = alive('canvas');
  canvas?.setIgnoreMouseEvents(!drawing);
}

function layout(): void {
  const display = sharedDisplay();
  const canvas = alive('canvas');
  if (canvas) {
    // Full display bounds (not the work area): the capture includes the menu bar and Dock.
    canvas.setBounds(display.bounds);
    pin(canvas, 'pop-up-menu');
    applyDrawing();
  }
  const toolbar = alive('toolbar');
  if (toolbar) {
    const { workArea } = display;
    toolbar.setBounds({
      x: Math.round(workArea.x + (workArea.width - toolbarWidth) / 2),
      y: workArea.y + TOOLBAR_TOP_OFFSET_PX,
      width: toolbarWidth,
      height: toolbarHeight,
    });
    pin(toolbar, 'screen-saver');
  }
}

function baseOptions(): BrowserWindowConstructorOptions {
  return {
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hiddenInMissionControl: true,
    alwaysOnTop: true,
    acceptFirstMouse: true,
    autoHideMenuBar: true,
    enableLargerThanScreen: true,
    // Non-activating: drawing must not pull focus from the app being shown.
    ...(process.platform === 'darwin' ? { type: 'panel' } : {}),
  };
}

export function shareAnnotationsWindowOpen(
  details: HandlerDetails,
): WindowOpenHandlerResponse | null {
  const kind = kindOf(details);
  if (!kind) return null;
  const title = kind === 'canvas' ? 'Sovlium — рисование' : 'Sovlium — демонстрация';
  return { action: 'allow', overrideBrowserWindowOptions: { ...baseOptions(), title } };
}

export function isShareAnnotationsWindow(details: { url: string; frameName: string }): boolean {
  return kindOf(details) !== null;
}

export function configureShareAnnotationsWindow(
  window: BrowserWindow,
  details: { url: string; frameName: string },
  owner: BrowserWindow | null,
): void {
  const kind = kindOf(details);
  if (!kind) return;

  windows[kind] = window;
  if (owner && !owner.isDestroyed()) ownerBounds = owner.getBounds();

  if (kind === 'canvas') {
    drawing = false;
    window.setIgnoreMouseEvents(true);
  } else {
    // Best effort: ScreenCaptureKit on recent macOS may still capture it.
    window.setContentProtection(true);
  }

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.on('closed', () => {
    if (windows[kind] !== window) return;
    delete windows[kind];
    if (kind === 'canvas') drawing = false;
    else {
      toolbarWidth = SHARE_ANNOTATION_TOOLBAR_SIZE.width;
      toolbarHeight = SHARE_ANNOTATION_TOOLBAR_SIZE.height;
    }
  });

  layout();
  // Chromium applies the `window.open` feature bounds after creation.
  setTimeout(layout, 0);
}

export function layoutShareAnnotations(
  capture: ShareCaptureSize | null,
  owner: BrowserWindow | null,
): void {
  captureSize = capture;
  if (owner && !owner.isDestroyed()) ownerBounds = owner.getBounds();
  layout();
}

function clampToolbar(width: number, height: number): { width: number; height: number } {
  const limits = SHARE_ANNOTATION_TOOLBAR_LIMITS;
  return {
    width: Math.round(Math.min(limits.maxWidth, Math.max(limits.minWidth, width))),
    height: Math.round(
      Math.min(limits.maxHeight, Math.max(SHARE_ANNOTATION_TOOLBAR_SIZE.height, height)),
    ),
  };
}

/** Keeps the dragged position; size follows the bar and the panel under it. */
export function setShareToolbarSize(width: number, height: number): void {
  const size = clampToolbar(width, height);
  toolbarWidth = size.width;
  toolbarHeight = size.height;
  const toolbar = alive('toolbar');
  if (!toolbar) return;
  const bounds = toolbar.getBounds();
  const { workArea } = screen.getDisplayMatching(bounds);
  // Stay centered on the previous position, and inside the display.
  const x = Math.round(
    Math.min(
      Math.max(workArea.x, bounds.x + (bounds.width - size.width) / 2),
      workArea.x + workArea.width - size.width,
    ),
  );
  const y = Math.round(
    Math.min(Math.max(workArea.y, bounds.y), workArea.y + workArea.height - size.height),
  );
  toolbar.setBounds({ x, y, width: size.width, height: size.height });
}

export function setShareAnnotationDrawing(enabled: boolean): void {
  drawing = enabled;
  applyDrawing();
  const toolbar = alive('toolbar');
  if (toolbar) pin(toolbar, 'screen-saver');
}
