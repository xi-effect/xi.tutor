import { BrowserWindow, type WebPreferences } from 'electron';
import { DEFAULT_WINDOW, PRODUCT_NAME } from '../../shared/constants';
import type { ElectronSurface } from '../../shared/types';
import {
  getAppOrigin,
  getDevRendererUrl,
  getPreloadPath,
  getRemoteRendererUrl,
  isBundledWebMode,
  isDev,
} from '../config';
import { installWindowNavigationGuard } from '../navigation';
import { getSovliumSession } from '../session';
import { loadWindowState, saveWindowState } from '../window-state';

export function createWebPreferences(surface: ElectronSurface): WebPreferences {
  return {
    preload: getPreloadPath(),
    session: getSovliumSession(),
    sandbox: true,
    contextIsolation: true,
    nodeIntegration: false,
    webSecurity: true,
    allowRunningInsecureContent: false,
    additionalArguments: [`--sovlium-surface=${surface}`],
  };
}

function loadRenderer(window: BrowserWindow, pathname = '/'): void {
  const remote = getRemoteRendererUrl();
  if (remote) {
    void window.loadURL(`${remote}${pathname}`);
    return;
  }
  if (isBundledWebMode()) {
    void window.loadURL(`${getAppOrigin()}${pathname}`);
    return;
  }
  void window.loadURL(`${getDevRendererUrl()}${pathname}`);
}

export function createMainWindow(): BrowserWindow {
  const saved = loadWindowState();
  const window = new BrowserWindow({
    title: PRODUCT_NAME,
    width: saved.width,
    height: saved.height,
    x: saved.x,
    y: saved.y,
    minWidth: DEFAULT_WINDOW.minWidth,
    minHeight: DEFAULT_WINDOW.minHeight,
    show: false,
    autoHideMenuBar: true,
    webPreferences: createWebPreferences('main'),
  });

  if (saved.maximized) {
    window.maximize();
  }

  installWindowNavigationGuard(window);

  const persist = () => {
    const bounds = window.getNormalBounds();
    saveWindowState({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      maximized: window.isMaximized(),
    });
  };

  window.on('resize', persist);
  window.on('move', persist);
  window.on('close', persist);

  window.once('ready-to-show', () => {
    window.show();
  });

  if (isDev()) {
    window.webContents.openDevTools({ mode: 'detach' });
  }

  loadRenderer(window);
  return window;
}

export function showMainWindow(window: BrowserWindow | null): void {
  if (!window || window.isDestroyed()) return;
  if (window.isMinimized()) window.restore();
  window.show();
  window.focus();
}
