import { BrowserWindow, shell, type WebContents } from 'electron';
import { isAllowedNavigation, isSafeExternalUrl } from './security';
import {
  callOverlayWindowOpen,
  configureCallOverlayWindow,
  isCallOverlayRequest,
} from './call-pip';
import {
  configureShareAnnotationsWindow,
  isShareAnnotationsWindow,
  shareAnnotationsWindowOpen,
} from './share-annotations';

export async function openExternalUrl(url: string): Promise<void> {
  if (!isSafeExternalUrl(url)) {
    throw new Error('URL is not allowed');
  }
  await shell.openExternal(url);
}

export function installNavigationGuard(contents: WebContents): void {
  contents.setWindowOpenHandler((details) => {
    const popup = callOverlayWindowOpen(details) ?? shareAnnotationsWindowOpen(details);
    if (popup) return popup;
    void openExternalUrl(details.url).catch((error) => {
      console.warn('[xi.electron] blocked window.open', details.url, error);
    });
    return { action: 'deny' };
  });

  contents.on('did-create-window', (window, details) => {
    if (isCallOverlayRequest(details)) {
      configureCallOverlayWindow(window);
    } else if (isShareAnnotationsWindow(details)) {
      configureShareAnnotationsWindow(window, details, BrowserWindow.fromWebContents(contents));
    }
  });

  contents.on('will-navigate', (event, url) => {
    if (isAllowedNavigation(url)) return;
    event.preventDefault();
    void openExternalUrl(url).catch((error) => {
      console.warn('[xi.electron] blocked navigation', url, error);
    });
  });
}

export function installWindowNavigationGuard(window: BrowserWindow): void {
  installNavigationGuard(window.webContents);
}
