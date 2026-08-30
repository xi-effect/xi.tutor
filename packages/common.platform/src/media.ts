import { isDesktopNative, isMobileNative, isNativeShell } from './detect';
import { invokeCommand } from './native';

export type MediaPermissionKind = 'camera' | 'microphone' | 'screen';
export type MediaPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

function mapNativeStatus(value: string | undefined): MediaPermissionStatus {
  if (value === 'granted' || value === 'denied' || value === 'prompt' || value === 'unsupported') {
    return value;
  }
  return 'prompt';
}

async function queryWebPermission(kind: 'camera' | 'microphone'): Promise<MediaPermissionStatus> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return 'unsupported';
  }
  try {
    const status = await navigator.permissions.query({
      name: kind,
    } as unknown as PermissionDescriptor);
    if (status.state === 'granted' || status.state === 'denied' || status.state === 'prompt') {
      return status.state;
    }
    return 'prompt';
  } catch {
    return 'unsupported';
  }
}

/** Screen share exists in desktop WebViews; not in iOS/Android WKWebView / WebView. */
export function isScreenShareSupported(): boolean {
  if (isMobileNative()) return false;
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getDisplayMedia === 'function'
  );
}

export async function queryMediaPermission(
  kind: MediaPermissionKind,
): Promise<MediaPermissionStatus> {
  if (kind === 'screen' && isMobileNative()) {
    return 'unsupported';
  }

  if (isNativeShell()) {
    try {
      const status = await invokeCommand<string>('media_permission_status', { kind });
      return mapNativeStatus(status);
    } catch (err) {
      console.warn('[common.platform] media_permission_status failed', err);
    }
  }

  if (kind === 'screen') return isScreenShareSupported() ? 'prompt' : 'unsupported';
  return queryWebPermission(kind);
}

export async function requestMediaPermission(
  kind: MediaPermissionKind,
): Promise<MediaPermissionStatus> {
  if (kind === 'screen' && isMobileNative()) {
    return 'unsupported';
  }

  if (isNativeShell()) {
    try {
      const status = await invokeCommand<string>('media_permission_request', { kind });
      return mapNativeStatus(status);
    } catch (err) {
      console.warn('[common.platform] media_permission_request failed', err);
    }
  }

  if (kind === 'screen') return isScreenShareSupported() ? 'prompt' : 'unsupported';
  return queryWebPermission(kind);
}

export async function getUserMedia(constraints?: MediaStreamConstraints): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('getUserMedia is not available');
  }
  return navigator.mediaDevices.getUserMedia(constraints);
}

export async function getDisplayMedia(options?: DisplayMediaStreamOptions): Promise<MediaStream> {
  if (!isScreenShareSupported() || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('getDisplayMedia is not available');
  }
  return navigator.mediaDevices.getDisplayMedia(options);
}

let mediaAdaptersInstalled = false;

/**
 * Preflights OS-level camera / mic (and desktop screen TCC) before LiveKit
 * hits `getUserMedia` / `getDisplayMedia`. Idempotent. No-op in the browser.
 */
export function installNativeMediaAdapters(): void {
  if (mediaAdaptersInstalled || typeof navigator === 'undefined') return;
  if (!isNativeShell()) return;

  const mediaDevices = navigator.mediaDevices;
  if (!mediaDevices) return;

  mediaAdaptersInstalled = true;

  if (typeof mediaDevices.getUserMedia === 'function') {
    const original = mediaDevices.getUserMedia.bind(mediaDevices);
    mediaDevices.getUserMedia = (async (constraints?: MediaStreamConstraints) => {
      try {
        if (constraints?.video) await requestMediaPermission('camera');
        if (constraints?.audio) await requestMediaPermission('microphone');
      } catch {
        // Permission preflight must never block capture.
      }
      return original(constraints);
    }) as typeof mediaDevices.getUserMedia;
  }

  if (isDesktopNative() && typeof mediaDevices.getDisplayMedia === 'function') {
    const original = mediaDevices.getDisplayMedia.bind(mediaDevices);
    mediaDevices.getDisplayMedia = (async (options?: DisplayMediaStreamOptions) => {
      try {
        await requestMediaPermission('screen');
      } catch {
        // Permission preflight must never block capture.
      }
      // Annotations live in a separate always-on-top window, so they only reach
      // the remote side when the captured surface is a whole display that also
      // includes this app's own windows.
      const stream = await original({
        ...options,
        video: {
          ...(typeof options?.video === 'object' ? options.video : {}),
          displaySurface: 'monitor',
        },
        selfBrowserSurface: 'include',
        monitorTypeSurfaces: 'include',
      } as DisplayMediaStreamOptions);
      const settings = stream.getVideoTracks()[0]?.getSettings() as
        (MediaTrackSettings & { displaySurface?: string }) | undefined;
      console.info('[common.platform] display capture surface:', settings?.displaySurface);
      return stream;
    }) as typeof mediaDevices.getDisplayMedia;
  }
}

/** @internal tests */
export function resetMediaAdaptersInstalled(): void {
  mediaAdaptersInstalled = false;
}
