import { app, BrowserWindow } from 'electron';
import { EVENTS } from '../shared/channels';
import type { UpdaterState } from '../shared/types';
import { openExternalUrl } from './navigation';
import { sendToRenderer } from './send';
import {
  feedDirectoryUrl,
  isReleasePageUrl,
  pickLatestElectronTag,
  releasePageUrl,
  releasesApiUrl,
} from './updater-feed';

const EMPTY: UpdaterState = {
  status: 'not-available',
  version: null,
  percent: null,
  releaseUrl: null,
  canInstall: false,
  message: null,
};

const PUBLIC_ERROR = 'Не удалось проверить обновление';
const STABLE_VERSION = /^\d+\.\d+\.\d+$/;

let state: UpdaterState = EMPTY;
let started = false;

export function getUpdaterState(): UpdaterState {
  return state;
}

function emit(next: UpdaterState): void {
  state = next;
  for (const window of BrowserWindow.getAllWindows()) {
    sendToRenderer(window.webContents, EVENTS.updaterState, next);
  }
}

function errorState(): UpdaterState {
  return {
    status: 'error',
    version: state.version,
    percent: null,
    releaseUrl: state.releaseUrl,
    canInstall: false,
    message: PUBLIC_ERROR,
  };
}

function stableVersion(version: unknown): string | null {
  return typeof version === 'string' && STABLE_VERSION.test(version) ? version : null;
}

async function resolveLatestTag(): Promise<string | null> {
  const tags: string[] = [];
  for (let page = 1; page <= 5; page += 1) {
    const response = await fetch(releasesApiUrl(page), {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Sovlium',
      },
    });
    if (response.status === 404) return pickLatestElectronTag(tags);
    if (!response.ok) {
      throw new Error(`GitHub releases feed returned ${response.status}`);
    }
    const body: unknown = await response.json();
    if (!Array.isArray(body) || body.length === 0) break;
    for (const item of body) {
      if (!item || typeof item !== 'object' || !('tag_name' in item)) continue;
      const tagName = item.tag_name;
      if (typeof tagName === 'string') tags.push(tagName);
    }
    if (body.length < 100) break;
  }
  return pickLatestElectronTag(tags);
}

/**
 * Packaged-app updater.
 *
 * The repository also publishes Tauri releases, so `/releases/latest` is not
 * the Electron feed. The newest `electron-v*` tag is resolved from the public
 * GitHub releases list, then electron-updater reads `latest.yml` /
 * `latest-mac.yml` from that GitHub Release.
 *
 * Windows downloads in the background and installs only after the user asks.
 * macOS is unsigned, so it only reports that a release exists.
 */
export async function initUpdater(): Promise<void> {
  if (!app.isPackaged || started) return;
  started = true;
  emit({ ...EMPTY, status: 'checking' });

  try {
    const tag = await resolveLatestTag();
    const feed = tag ? feedDirectoryUrl(tag) : null;
    if (!feed) {
      emit(EMPTY);
      return;
    }

    const { autoUpdater } = await import('electron-updater');
    const logModule = await import('electron-log/main');
    const log = logModule.default;
    log.transports.file.level = 'info';
    autoUpdater.logger = {
      info: (...args: unknown[]) => log.info(...args),
      warn: (...args: unknown[]) => log.warn(...args),
      error: (...args: unknown[]) => log.error(...args),
      debug: (...args: unknown[]) => log.debug(...args),
    };
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.setFeedURL({ provider: 'generic', url: feed });

    autoUpdater.on('checking-for-update', () => {
      emit({ ...EMPTY, status: 'checking' });
    });

    autoUpdater.on('update-available', (info) => {
      const version = stableVersion(info.version);
      const releaseUrl = version ? releasePageUrl(version) : null;
      if (process.platform === 'win32') {
        emit({
          status: 'available',
          version,
          percent: null,
          releaseUrl,
          canInstall: false,
          message: null,
        });
        emit({
          status: 'downloading',
          version,
          percent: 0,
          releaseUrl,
          canInstall: false,
          message: null,
        });
        void autoUpdater.downloadUpdate().catch((error: unknown) => {
          log.error('[xi.electron] update download failed', error);
          emit(errorState());
        });
        return;
      }

      // TODO: enable download + quitAndInstall on macOS after signing and notarization.
      emit({
        status: 'available',
        version,
        percent: null,
        releaseUrl,
        canInstall: false,
        message: null,
      });
    });

    autoUpdater.on('download-progress', (progress) => {
      if (process.platform !== 'win32') return;
      const percent = Number.isFinite(progress.percent)
        ? Math.max(0, Math.min(100, Math.round(progress.percent)))
        : null;
      emit({
        status: 'downloading',
        version: state.version,
        percent,
        releaseUrl: state.releaseUrl,
        canInstall: false,
        message: null,
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      if (process.platform !== 'win32') return;
      const version = stableVersion(info.version) ?? state.version;
      emit({
        status: 'downloaded',
        version,
        percent: 100,
        releaseUrl: version ? releasePageUrl(version) : state.releaseUrl,
        canInstall: true,
        message: null,
      });
    });

    autoUpdater.on('update-not-available', () => {
      emit(EMPTY);
    });

    autoUpdater.on('error', (error) => {
      log.error('[xi.electron] updater', error);
      emit(errorState());
    });

    await autoUpdater.checkForUpdates();
  } catch (error) {
    console.error('[xi.electron] updater', error);
    emit(errorState());
  }
}

export async function installDownloadedUpdate(): Promise<boolean> {
  if (process.platform !== 'win32' || state.status !== 'downloaded' || !state.canInstall) {
    return false;
  }
  const { autoUpdater } = await import('electron-updater');
  autoUpdater.quitAndInstall(false, true);
  return true;
}

export async function openUpdateRelease(): Promise<boolean> {
  const url = state.releaseUrl;
  if (!url || !isReleasePageUrl(url)) return false;
  await openExternalUrl(url);
  return true;
}
