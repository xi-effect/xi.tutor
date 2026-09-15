import { desktopCapturer, systemPreferences, type Session } from 'electron';
import type { MediaPermissionKind, MediaPermissionStatus } from '../shared/types';
import { isSovliumHost, isTrustedRendererOrigin, parseUrl } from './security';
import { isDev } from './config';

const MEDIA_PERMISSIONS = new Set([
  'media',
  'mediaKeySystem',
  'display-capture',
  'audioCapture',
  'videoCapture',
  'speaker-selection',
]);
const EXTRA_PERMISSIONS = new Set(['notifications', 'clipboard-sanitized-write', 'clipboard-read']);

function isMediaRelatedPermission(permission: string): boolean {
  if (MEDIA_PERMISSIONS.has(permission)) return true;
  const name = permission.toLowerCase();
  return (
    name.includes('audio') ||
    name.includes('video') ||
    name.includes('media') ||
    name.includes('capture') ||
    name.includes('speaker')
  );
}

function isAllowedRendererOrigin(origin: string): boolean {
  if (!origin || origin === 'null') return true;
  if (isTrustedRendererOrigin(origin)) return true;
  const url = parseUrl(origin) ?? parseUrl(`${origin}/`);
  if (!url) return false;
  if (url.protocol === 'blob:' || url.protocol === 'about:') return true;
  if (isSovliumHost(url.hostname)) return true;
  if (!isDev()) return false;
  return url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]';
}

function mapDarwinStatus(status: string): MediaPermissionStatus {
  if (status === 'granted') return 'granted';
  if (status === 'denied' || status === 'restricted') return 'denied';
  if (status === 'not-determined') return 'prompt';
  return 'prompt';
}

export async function getMediaPermissionStatus(
  kind: MediaPermissionKind,
): Promise<MediaPermissionStatus> {
  if (kind === 'screen') {
    if (process.platform === 'darwin') {
      const status = systemPreferences.getMediaAccessStatus('screen');
      return mapDarwinStatus(status);
    }
    return 'prompt';
  }

  if (process.platform === 'darwin') {
    const status = systemPreferences.getMediaAccessStatus(kind);
    return mapDarwinStatus(status);
  }

  return 'prompt';
}

let mediaAccessQueue: Promise<void> = Promise.resolve();

function enqueueMediaAccess<T>(task: () => Promise<T>): Promise<T> {
  const next = mediaAccessQueue.then(task, task);
  mediaAccessQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

export async function requestMediaPermission(
  kind: MediaPermissionKind,
): Promise<MediaPermissionStatus> {
  if (kind === 'screen') {
    return getMediaPermissionStatus(kind);
  }

  const current = await getMediaPermissionStatus(kind);
  if (current === 'granted' || current === 'denied' || current === 'unsupported') {
    return current;
  }

  if (process.platform === 'darwin') {
    return enqueueMediaAccess(async () => {
      const already = await getMediaPermissionStatus(kind);
      if (already === 'granted' || already === 'denied') return already;
      const granted = await systemPreferences.askForMediaAccess(kind);
      return granted ? 'granted' : 'denied';
    });
  }

  return current;
}

export function installPermissionHandlers(ses: Session): void {
  const allowPermission = (permission: string, origin: string): boolean => {
    if (isMediaRelatedPermission(permission)) {
      return isAllowedRendererOrigin(origin);
    }
    if (!isAllowedRendererOrigin(origin) && origin) return false;
    return EXTRA_PERMISSIONS.has(permission);
  };

  ses.setPermissionRequestHandler((_webContents, permission, callback, details) => {
    let origin = '';
    if (details.requestingUrl) {
      try {
        origin = new URL(details.requestingUrl).origin;
      } catch {
        origin = details.requestingUrl;
      }
    }
    callback(allowPermission(permission, origin));
  });

  ses.setPermissionCheckHandler((_webContents, permission, requestingOrigin) => {
    return allowPermission(permission, requestingOrigin);
  });

  // Electron does not complete getDisplayMedia without this handler.
  // useSystemPicker: on macOS 15+ the native ScreenCaptureKit picker is used and
  // this callback is skipped. Empty callback({}) used to grant the default
  // display (Finder/Dock in the call tile). Only pass a concrete source here.
  ses.setDisplayMediaRequestHandler(
    async (_request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({
          types: ['screen', 'window'],
          thumbnailSize: { width: 0, height: 0 },
        });
        const source = sources[0];
        if (!source) {
          callback({});
          return;
        }
        callback({ video: source });
      } catch (error) {
        console.warn('[xi.electron] display media handler failed', error);
        callback({});
      }
    },
    { useSystemPicker: true },
  );
}
