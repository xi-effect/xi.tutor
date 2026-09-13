import { desktopCapturer, systemPreferences, type Session } from 'electron';
import type { MediaPermissionKind, MediaPermissionStatus } from '../shared/types';
import { isTrustedRendererOrigin } from './security';

const MEDIA_PERMISSIONS = new Set(['media', 'mediaKeySystem', 'display-capture']);
const EXTRA_PERMISSIONS = new Set(['notifications', 'clipboard-sanitized-write', 'clipboard-read']);

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

export async function requestMediaPermission(
  kind: MediaPermissionKind,
): Promise<MediaPermissionStatus> {
  if (kind === 'screen') {
    return getMediaPermissionStatus(kind);
  }

  if (process.platform === 'darwin') {
    const granted = await systemPreferences.askForMediaAccess(kind);
    return granted ? 'granted' : 'denied';
  }

  return getMediaPermissionStatus(kind);
}

export function installPermissionHandlers(ses: Session): void {
  ses.setPermissionRequestHandler((_webContents, permission, callback, details) => {
    const origin = details.requestingUrl ? new URL(details.requestingUrl).origin : '';
    if (!isTrustedRendererOrigin(origin)) {
      callback(false);
      return;
    }
    if (MEDIA_PERMISSIONS.has(permission) || EXTRA_PERMISSIONS.has(permission)) {
      callback(true);
      return;
    }
    callback(false);
  });

  ses.setPermissionCheckHandler((_webContents, permission, requestingOrigin) => {
    if (!isTrustedRendererOrigin(requestingOrigin)) return false;
    return MEDIA_PERMISSIONS.has(permission) || EXTRA_PERMISSIONS.has(permission);
  });

  ses.setDisplayMediaRequestHandler(
    async (_request, callback) => {
      try {
        if (process.platform === 'darwin') {
          callback({});
          return;
        }
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
