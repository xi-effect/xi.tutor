import { app } from 'electron';
import { getUpdateFeedUrl, isDev } from './config';

/**
 * Electron binary updater is intentionally disabled until a dedicated
 * `releases.sovlium.ru/electron` feed exists. The Tauri desktop endpoint
 * (`/desktop`) uses a different artifact format and must not be reused.
 */
export async function initUpdater(): Promise<void> {
  const feed = getUpdateFeedUrl();
  if (!feed || isDev()) {
    return;
  }

  try {
    const { autoUpdater } = await import('electron-updater');
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: feed,
    });
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.on('error', (error) => {
      console.warn('[xi.electron] updater error', error);
    });
    await autoUpdater.checkForUpdates();
  } catch (error) {
    console.warn('[xi.electron] updater is not configured', error);
  }

  void app.getVersion();
}
