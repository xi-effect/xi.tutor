import { app, type BrowserWindow } from 'electron';
import { DEEP_LINK_SCHEME } from '../shared/constants';
import { EVENTS } from '../shared/channels';
import { toDeepLinkPath } from './security';
import { sendToRenderer } from './send';
import { showMainWindow } from './windows/main-window';

let pending: string | null = null;

export function consumePendingDeepLink(): string | null {
  const value = pending;
  pending = null;
  return value;
}

export function dispatchDeepLink(window: BrowserWindow | null, url: string): void {
  const path = toDeepLinkPath(url);
  if (!path) return;
  if (!window || window.isDestroyed()) {
    pending = path;
    return;
  }
  showMainWindow(window);
  sendToRenderer(window.webContents, EVENTS.deepLink, path);
}

export function registerDeepLinkProtocol(): void {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(DEEP_LINK_SCHEME, process.execPath, [process.argv[1]]);
    }
  } else {
    app.setAsDefaultProtocolClient(DEEP_LINK_SCHEME);
  }
}

export function findDeepLinkInArgv(argv: string[]): string | null {
  return argv.find((arg) => arg.startsWith(`${DEEP_LINK_SCHEME}://`)) ?? null;
}
