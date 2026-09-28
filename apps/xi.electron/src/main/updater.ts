import { createRequire } from 'node:module';
import { app, BrowserWindow } from 'electron';
import type { AppUpdater } from 'electron-updater';
import { EVENTS } from '../shared/channels';
import type { UpdaterState } from '../shared/types';
import { openExternalUrl } from './navigation';
import { sendToRenderer } from './send';
import {
  feedDirectoryUrl,
  isReleasePageUrl,
  pickLatestElectronTag,
  publishedStableTagNames,
  releasePageUrl,
  releasesApiUrl,
} from './updater-feed';

const nodeRequire = createRequire(import.meta.url);

const EMPTY: UpdaterState = {
  status: 'not-available',
  version: null,
  percent: null,
  releaseUrl: null,
  canInstall: false,
  message: null,
};

const PUBLIC_ERROR = 'Не удалось проверить обновления';
const DOWNLOAD_ERROR = 'Не удалось скачать обновление';
const STABLE_VERSION = /^\d+\.\d+\.\d+$/;

let state: UpdaterState = EMPTY;
let checking = false;
let updaterPromise: Promise<AppUpdater> | null = null;

export function getUpdaterState(): UpdaterState {
  return state;
}

function emit(next: UpdaterState): void {
  state = next;
  for (const window of BrowserWindow.getAllWindows()) {
    sendToRenderer(window.webContents, EVENTS.updaterState, next);
  }
}

function errorState(message: string): UpdaterState {
  return {
    status: 'error',
    version: state.version,
    percent: null,
    releaseUrl: state.releaseUrl,
    canInstall: false,
    message,
  };
}

function stableVersion(version: unknown): string | null {
  return typeof version === 'string' && STABLE_VERSION.test(version) ? version : null;
}

async function reportError(error: unknown, message = PUBLIC_ERROR): Promise<void> {
  try {
    const logModule = await import('electron-log/main');
    logModule.default.error('[xi.electron] updater', error);
  } catch (logError) {
    console.error('[xi.electron] updater', error, logError);
  }
  emit(errorState(message));
}

async function resolveLatestTag(): Promise<string | null> {
  const tags: string[] = [];
  for (let page = 1; page <= 5; page += 1) {
    const response = await fetch(releasesApiUrl(page), {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Sovlium',
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (response.status === 404) return pickLatestElectronTag(tags);
    if (!response.ok) {
      throw new Error(`GitHub releases feed returned ${response.status}`);
    }
    const body: unknown = await response.json();
    if (!Array.isArray(body) || body.length === 0) break;
    tags.push(...publishedStableTagNames(body));
    if (body.length < 100) break;
  }
  return pickLatestElectronTag(tags);
}

async function loadUpdater(): Promise<AppUpdater> {
  if (!updaterPromise) updaterPromise = createUpdater();
  return updaterPromise;
}

function loadAutoUpdater(): AppUpdater {
  const updater = nodeRequire('electron-updater') as { autoUpdater?: AppUpdater };
  if (!updater.autoUpdater) {
    throw new Error('electron-updater did not export autoUpdater');
  }
  return updater.autoUpdater;
}

async function createUpdater(): Promise<AppUpdater> {
  try {
    const autoUpdater = loadAutoUpdater();
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
    autoUpdater.allowPrerelease = false;
    autoUpdater.allowDowngrade = false;
    bindUpdater(autoUpdater);
    return autoUpdater;
  } catch (error) {
    updaterPromise = null;
    throw error;
  }
}

function bindUpdater(autoUpdater: AppUpdater): void {
  autoUpdater.on('checking-for-update', () => {
    if (state.status === 'downloading' || state.status === 'downloaded') return;
    emit({ ...EMPTY, status: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    const version = stableVersion(info.version);
    if (!version) {
      emit(EMPTY);
      return;
    }
    emit({
      status: 'available',
      version,
      percent: null,
      releaseUrl: releasePageUrl(version),
      canInstall: false,
      message: null,
    });
  });

  autoUpdater.on('download-progress', (progress) => {
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
    const message = state.status === 'downloading' ? DOWNLOAD_ERROR : PUBLIC_ERROR;
    void reportError(error, message);
  });
}

/**
 * Packaged-app updater.
 *
 * `/releases/latest` is not the Electron feed: another product release can be
 * newer. The newest published `electron-v*` tag on xi-effect/xi.tutor is
 * resolved from the public GitHub releases list (drafts and pre-releases are
 * skipped), then electron-updater reads `latest.yml` / `latest-mac.yml` from
 * that release.
 *
 * Download and quitAndInstall run only after the user asks.
 */
export function initUpdater(): void {
  if (!app.isPackaged) return;
  void checkForUpdates();
}

export async function checkForUpdates(): Promise<UpdaterState> {
  if (!app.isPackaged) {
    emit(EMPTY);
    return state;
  }
  if (checking || state.status === 'downloading' || state.status === 'downloaded') {
    return state;
  }

  checking = true;
  emit({ ...EMPTY, status: 'checking' });
  try {
    const updater = await loadUpdater();
    const tag = await resolveLatestTag();
    const feed = tag ? feedDirectoryUrl(tag) : null;
    if (!feed) {
      emit(EMPTY);
      return state;
    }
    updater.setFeedURL({ provider: 'generic', url: feed });
    await updater.checkForUpdates();
  } catch (error) {
    await reportError(error);
  } finally {
    checking = false;
  }
  return state;
}

export async function downloadAvailableUpdate(): Promise<boolean> {
  if (!app.isPackaged || state.status !== 'available') return false;
  try {
    const updater = await loadUpdater();
    emit({
      status: 'downloading',
      version: state.version,
      percent: 0,
      releaseUrl: state.releaseUrl,
      canInstall: false,
      message: null,
    });
    void updater.downloadUpdate().catch((error: unknown) => {
      void reportError(error, DOWNLOAD_ERROR);
    });
    return true;
  } catch (error) {
    await reportError(error, DOWNLOAD_ERROR);
    return false;
  }
}

export async function installDownloadedUpdate(): Promise<boolean> {
  if (state.status !== 'downloaded' || !state.canInstall) return false;
  const updater = await loadUpdater();
  updater.quitAndInstall(false, true);
  return true;
}

export async function openUpdateRelease(): Promise<boolean> {
  const url = state.releaseUrl;
  if (!url || !isReleasePageUrl(url)) return false;
  await openExternalUrl(url);
  return true;
}
