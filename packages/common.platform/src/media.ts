import { isDesktopNative, isElectronShell, isMobileNative, isNativeShell } from './detect';
import { invokeCommand } from './native';
import { chooseShareSource } from './shareSourcePicker';

export type MediaPermissionKind = 'camera' | 'microphone' | 'screen';
export type MediaPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

function mapNativeStatus(value: string | undefined): MediaPermissionStatus {
  if (value === 'granted' || value === 'denied' || value === 'prompt' || value === 'unsupported') {
    return value;
  }
  return 'prompt';
}

async function queryWebPermission(kind: 'camera' | 'microphone'): Promise<MediaPermissionStatus> {
  const query =
    originalPermissionsQuery ?? navigator.permissions?.query?.bind(navigator.permissions);
  if (typeof navigator === 'undefined' || typeof query !== 'function') {
    return 'unsupported';
  }
  try {
    const status = await query({
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
  if (isElectronShell()) {
    return captureGranted[kind] ? 'granted' : 'prompt';
  }
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
      const mapped = mapNativeStatus(status);
      if ((kind === 'camera' || kind === 'microphone') && mapped === 'granted') {
        markCaptureGranted(kind);
      }
      return mapped;
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

function constraintSize(value: ConstrainULong | undefined): number | undefined {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'object') return undefined;
  return value.exact ?? value.ideal ?? value.max;
}

/**
 * LiveKit asks for `ideal` 1920×1080. On a 16:10 display Chromium's
 * ScreenCaptureKit capturer then shrinks the picture inside the frame and
 * pads the rest with black. `max` limits keep the display's own aspect ratio.
 */
export function fitDisplayVideo(
  video: DisplayMediaStreamOptions['video'],
): DisplayMediaStreamOptions['video'] {
  if (!video || typeof video !== 'object') return video;
  const { width, height, ...rest } = video;
  delete rest.aspectRatio;
  const maxWidth = constraintSize(width);
  const maxHeight = constraintSize(height);
  if (maxWidth === undefined && maxHeight === undefined) return video;
  return {
    ...rest,
    ...(maxWidth !== undefined ? { width: { max: maxWidth } } : {}),
    ...(maxHeight !== undefined ? { height: { max: maxHeight } } : {}),
  };
}

const captureGranted: Record<'camera' | 'microphone', boolean> = {
  camera: false,
  microphone: false,
};

const permissionStatuses = new Map<string, NativePermissionStatus>();

let originalGetUserMedia: MediaDevices['getUserMedia'] | undefined;
let originalGetDisplayMedia: MediaDevices['getDisplayMedia'] | undefined;
let originalEnumerateDevices: MediaDevices['enumerateDevices'] | undefined;
let originalPermissionsQuery: Permissions['query'] | undefined;
let installedPermissionsStub = false;
let unlockingDeviceLabels = false;
let deviceLabelUnlockAttempted = false;

class NativePermissionStatus extends EventTarget implements PermissionStatus {
  readonly name: PermissionName;
  onchange: ((this: PermissionStatus, ev: Event) => void) | null = null;
  state: PermissionState;

  constructor(name: string, state: PermissionState) {
    super();
    this.name = name as PermissionName;
    this.state = state;
  }
}

function toPermissionState(status: MediaPermissionStatus): PermissionState {
  if (status === 'granted' || status === 'denied') return status;
  return 'prompt';
}

function setPermissionState(kind: 'camera' | 'microphone', state: PermissionState): void {
  const existing = permissionStatuses.get(kind);
  if (!existing) {
    permissionStatuses.set(kind, new NativePermissionStatus(kind, state));
    return;
  }
  if (existing.state === state) return;
  existing.state = state;
  const event = new Event('change');
  existing.dispatchEvent(event);
  existing.onchange?.call(existing, event);
}

function markCaptureGranted(kind: 'camera' | 'microphone'): void {
  captureGranted[kind] = true;
  deviceLabelUnlockAttempted = false;
  setPermissionState(kind, 'granted');
}

async function resolveQueryState(kind: 'camera' | 'microphone'): Promise<PermissionState> {
  if (captureGranted[kind]) return 'granted';
  const native = await queryMediaPermission(kind);
  // @xipkg/calls treats `prompt` as a blocked device and disables DeviceSelect.
  // Electron already allows media in the session; the OS dialog is getUserMedia.
  if (isElectronShell()) {
    return native === 'denied' ? 'denied' : 'granted';
  }
  return toPermissionState(native);
}

function installPermissionsQueryShim(): void {
  const queryCameraOrMic = async (kind: 'camera' | 'microphone'): Promise<PermissionStatus> => {
    const state = await resolveQueryState(kind);
    const existing = permissionStatuses.get(kind);
    if (existing) {
      if (existing.state !== state) setPermissionState(kind, state);
      return existing;
    }
    const status = new NativePermissionStatus(kind, state);
    permissionStatuses.set(kind, status);
    return status;
  };

  if (typeof navigator.permissions?.query === 'function') {
    originalPermissionsQuery = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = (async (permissionDesc: PermissionDescriptor) => {
      const name = (permissionDesc as { name?: string }).name;
      if (name === 'camera' || name === 'microphone') {
        return queryCameraOrMic(name);
      }
      if (!originalPermissionsQuery) {
        throw new TypeError(`Failed to execute 'query' on 'Permissions': ${name}`);
      }
      return originalPermissionsQuery(permissionDesc);
    }) as Permissions['query'];
    return;
  }

  installedPermissionsStub = true;
  const permissions: Pick<Permissions, 'query'> = {
    query: async (permissionDesc: PermissionDescriptor) => {
      const name = (permissionDesc as { name?: string }).name;
      if (name === 'camera' || name === 'microphone') {
        return queryCameraOrMic(name);
      }
      throw new TypeError(`Failed to execute 'query' on 'Permissions': ${name}`);
    },
  };
  Object.defineProperty(navigator, 'permissions', {
    configurable: true,
    writable: true,
    value: permissions,
  });
}

/**
 * Preflights OS-level camera / mic (and desktop screen TCC) before LiveKit
 * hits `getUserMedia` / `getDisplayMedia`. Also maps `navigator.permissions.query`
 * for camera/mic onto that OS status (and onto successful capture): Chromium in
 * Electron often leaves Permissions API at `denied`/`prompt` while tracks work,
 * and the call UI treats both as a blocked device.
 *
 * Idempotent. No-op in the browser.
 */
export function installNativeMediaAdapters(): void {
  if (mediaAdaptersInstalled || typeof navigator === 'undefined') return;
  if (!isNativeShell()) return;

  mediaAdaptersInstalled = true;
  installPermissionsQueryShim();

  const mediaDevices = navigator.mediaDevices;
  if (!mediaDevices) return;

  if (typeof mediaDevices.getUserMedia === 'function') {
    originalGetUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
    mediaDevices.getUserMedia = (async (constraints?: MediaStreamConstraints) => {
      // Electron: Chromium already triggers TCC via getUserMedia. Asking the OS
      // again on the main process (especially in parallel) can freeze the app.
      if (!isElectronShell()) {
        try {
          if (constraints?.video) await requestMediaPermission('camera');
          if (constraints?.audio) await requestMediaPermission('microphone');
        } catch {
          // Permission preflight must never block capture.
        }
      }
      const stream = await originalGetUserMedia!(constraints);
      if (stream.getVideoTracks().length > 0) markCaptureGranted('camera');
      if (stream.getAudioTracks().length > 0) markCaptureGranted('microphone');
      return stream;
    }) as typeof mediaDevices.getUserMedia;
  }

  if (
    isElectronShell() &&
    typeof mediaDevices.enumerateDevices === 'function' &&
    originalGetUserMedia
  ) {
    originalEnumerateDevices = mediaDevices.enumerateDevices.bind(mediaDevices);
    mediaDevices.enumerateDevices = (async () => {
      const listed = await originalEnumerateDevices!();
      const hasIds = listed.some((device) => device.deviceId);
      if (hasIds || unlockingDeviceLabels || deviceLabelUnlockAttempted) return listed;

      unlockingDeviceLabels = true;
      try {
        const stream = await originalGetUserMedia!({ audio: true, video: true });
        stream.getTracks().forEach((track) => track.stop());
        deviceLabelUnlockAttempted = true;
        return originalEnumerateDevices!();
      } catch {
        try {
          const audioOnly = await originalGetUserMedia!({ audio: true });
          audioOnly.getTracks().forEach((track) => track.stop());
          deviceLabelUnlockAttempted = true;
          return originalEnumerateDevices!();
        } catch {
          return listed;
        }
      } finally {
        unlockingDeviceLabels = false;
      }
    }) as typeof mediaDevices.enumerateDevices;
  }

  if (isDesktopNative() && typeof mediaDevices.getDisplayMedia === 'function') {
    originalGetDisplayMedia = mediaDevices.getDisplayMedia.bind(mediaDevices);
    mediaDevices.getDisplayMedia = (async (options?: DisplayMediaStreamOptions) => {
      if (isElectronShell()) {
        if (!(await chooseShareSource())) {
          throw new DOMException('Screen share was cancelled', 'NotAllowedError');
        }
        options = { ...options, video: fitDisplayVideo(options?.video) };
        try {
          return await originalGetDisplayMedia!({
            ...options,
            selfBrowserSurface: 'exclude',
          } as DisplayMediaStreamOptions);
        } catch {
          return originalGetDisplayMedia!(options);
        }
      }

      try {
        await requestMediaPermission('screen');
      } catch {
        // Permission preflight must never block capture.
      }
      // Annotations live in a separate always-on-top window, so they only reach
      // the remote side when the captured surface is a whole display that also
      // includes this app's own windows.
      const stream = await originalGetDisplayMedia!({
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
  if (typeof navigator !== 'undefined') {
    if (originalGetUserMedia && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    }
    if (originalEnumerateDevices && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices = originalEnumerateDevices;
    }
    if (originalGetDisplayMedia && navigator.mediaDevices) {
      navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
    }
    if (originalPermissionsQuery && navigator.permissions) {
      navigator.permissions.query = originalPermissionsQuery;
    } else if (installedPermissionsStub) {
      Reflect.deleteProperty(navigator, 'permissions');
    }
  }

  mediaAdaptersInstalled = false;
  installedPermissionsStub = false;
  originalGetUserMedia = undefined;
  originalGetDisplayMedia = undefined;
  originalEnumerateDevices = undefined;
  originalPermissionsQuery = undefined;
  unlockingDeviceLabels = false;
  deviceLabelUnlockAttempted = false;
  captureGranted.camera = false;
  captureGranted.microphone = false;
  permissionStatuses.clear();
}
