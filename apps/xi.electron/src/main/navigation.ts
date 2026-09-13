import { shell, type BrowserWindow, type WebContents } from 'electron';
import { isAllowedNavigation, isSafeExternalUrl } from './security';

export async function openExternalUrl(url: string): Promise<void> {
  if (!isSafeExternalUrl(url)) {
    throw new Error('URL is not allowed');
  }
  await shell.openExternal(url);
}

export function installNavigationGuard(contents: WebContents): void {
  contents.setWindowOpenHandler(({ url }) => {
    void openExternalUrl(url).catch((error) => {
      console.warn('[xi.electron] blocked window.open', url, error);
    });
    return { action: 'deny' };
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
