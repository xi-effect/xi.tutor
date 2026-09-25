import { contextBridge, ipcRenderer } from 'electron';
import { EVENTS, IPC } from '../shared/channels';
import {
  UPDATER_STATUSES,
  type ConferenceState,
  type MediaPermissionKind,
  type SlotBounds,
  type SovliumDesktopAPI,
  type UpdaterState,
  type UpdaterStatus,
} from '../shared/types';

function nativeOs(): 'macos' | 'windows' | 'linux' | 'unknown' {
  if (process.platform === 'darwin') return 'macos';
  if (process.platform === 'win32') return 'windows';
  if (process.platform === 'linux') return 'linux';
  return 'unknown';
}

function surface(): 'main' | 'conference' {
  const arg = process.argv.find((value) => value.startsWith('--sovlium-surface='));
  const value = arg?.slice('--sovlium-surface='.length);
  return value === 'conference' ? 'conference' : 'main';
}

function readUpdaterState(payload: unknown): UpdaterState {
  const record =
    payload !== null && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const status = UPDATER_STATUSES.includes(record.status as UpdaterStatus)
    ? (record.status as UpdaterStatus)
    : 'error';
  const version =
    typeof record.version === 'string' && /^\d+\.\d+\.\d+$/.test(record.version)
      ? record.version
      : null;
  const percent =
    typeof record.percent === 'number' && Number.isFinite(record.percent)
      ? Math.max(0, Math.min(100, Math.round(record.percent)))
      : null;
  const releaseUrl =
    typeof record.releaseUrl === 'string' &&
    /^https:\/\/github\.com\/xi-effect\/xi\.tutor\/releases\/tag\/electron-v\d+\.\d+\.\d+$/.test(
      record.releaseUrl,
    )
      ? record.releaseUrl
      : null;
  const message =
    status === 'error' && typeof record.message === 'string'
      ? record.message.replace(/\s+/g, ' ').slice(0, 180)
      : null;
  return {
    status,
    version,
    percent,
    releaseUrl,
    canInstall: record.canInstall === true && status === 'downloaded',
    message,
  };
}

function subscribe(channel: string, handler: (payload: unknown) => void): () => void {
  const listener = (_event: unknown, payload: unknown) => handler(payload);
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

const api: SovliumDesktopAPI = {
  app: {
    getInfo: () => ipcRenderer.invoke(IPC.appGetInfo),
    getPlatform: () => ipcRenderer.invoke(IPC.appGetPlatform),
    getVersion: async () => {
      const info = await ipcRenderer.invoke(IPC.appGetInfo);
      return info.version;
    },
  },
  window: {
    minimize: () => ipcRenderer.invoke(IPC.windowMinimize),
    maximize: () => ipcRenderer.invoke(IPC.windowMaximize),
    close: () => ipcRenderer.invoke(IPC.windowClose),
    focus: () => ipcRenderer.invoke(IPC.windowFocus),
    unminimize: () => ipcRenderer.invoke(IPC.windowUnminimize),
    isMinimized: () => ipcRenderer.invoke(IPC.windowIsMinimized),
    setTitle: (title: string) => ipcRenderer.invoke(IPC.windowSetTitle, title),
    onFocusChanged: (handler) =>
      subscribe(EVENTS.windowFocus, (payload) => handler(Boolean(payload))),
  },
  conference: {
    start: (input) => ipcRenderer.invoke(IPC.conferenceStart, input),
    leave: () => ipcRenderer.invoke(IPC.conferenceLeave),
    setSlotBounds: (bounds: SlotBounds | null) =>
      ipcRenderer.invoke(IPC.conferenceSetSlotBounds, bounds),
    enterFloatingMode: (size) => ipcRenderer.invoke(IPC.conferenceEnterFloating, size),
    exitFloatingMode: () => ipcRenderer.invoke(IPC.conferenceExitFloating),
    resizeFloating: (size) => ipcRenderer.invoke(IPC.conferenceResizeFloating, size),
    getState: () => ipcRenderer.invoke(IPC.conferenceGetState),
    notifyEnded: () => ipcRenderer.invoke(IPC.conferenceEnded),
    onStateChanged: (handler) =>
      subscribe(EVENTS.conferenceState, (payload) => handler(payload as ConferenceState)),
  },
  screenShare: {
    openControls: () => ipcRenderer.invoke(IPC.screenShareOpenControls),
    closeControls: () => ipcRenderer.invoke(IPC.screenShareCloseControls),
    focusMain: () => ipcRenderer.invoke(IPC.screenShareFocusMain),
    requestStop: () => ipcRenderer.invoke(IPC.screenShareRequestStop),
    onStop: (handler) => subscribe(EVENTS.shareOverlayStop, () => handler()),
    onAnnotation: (handler) => subscribe(EVENTS.shareAnnotation, handler),
    listSources: () => ipcRenderer.invoke(IPC.screenShareListSources),
    selectSource: (id) => ipcRenderer.invoke(IPC.screenShareSelectSource, id),
    layoutAnnotations: (capture) => ipcRenderer.invoke(IPC.screenShareLayoutAnnotations, capture),
    setAnnotationDrawing: (enabled) =>
      ipcRenderer.invoke(IPC.screenShareSetAnnotationDrawing, enabled),
    setToolbarSize: (size) => ipcRenderer.invoke(IPC.screenShareSetToolbarHeight, size),
  },
  remoteControl: {
    status: () => ipcRenderer.invoke(IPC.remoteControlStatus),
    requestAccess: () => ipcRenderer.invoke(IPC.remoteControlRequestAccess),
    setActive: (enabled) => ipcRenderer.invoke(IPC.remoteControlSetActive, enabled),
    input: (event) => ipcRenderer.send(IPC.remoteControlInput, event),
  },
  files: {
    save: (request) => ipcRenderer.invoke(IPC.filesSave, request),
  },
  notifications: {
    status: () => ipcRenderer.invoke(IPC.notificationsStatus),
    request: () => ipcRenderer.invoke(IPC.notificationsRequest),
    show: (input) => ipcRenderer.invoke(IPC.notificationsShow, input),
    onClicked: (handler) =>
      subscribe(EVENTS.notificationClick, (payload) => handler(String(payload ?? ''))),
  },
  clipboard: {
    writeText: (text) => ipcRenderer.invoke(IPC.clipboardWriteText, text),
    readText: () => ipcRenderer.invoke(IPC.clipboardReadText),
    writeHtml: (html, text) => ipcRenderer.invoke(IPC.clipboardWriteHtml, { html, text }),
    readHtml: () => ipcRenderer.invoke(IPC.clipboardReadHtml),
  },
  power: {
    setDisplaySleepBlocked: (enabled) =>
      ipcRenderer.invoke(IPC.powerSetDisplaySleepBlocked, enabled),
  },
  external: {
    openUrl: (url: string) => ipcRenderer.invoke(IPC.externalOpenUrl, url),
  },
  permissions: {
    status: (kind: MediaPermissionKind) => ipcRenderer.invoke(IPC.permissionsStatus, kind),
    request: (kind: MediaPermissionKind) => ipcRenderer.invoke(IPC.permissionsRequest, kind),
  },
  theme: {
    get: () => ipcRenderer.invoke(IPC.themeGet),
    set: (theme) => ipcRenderer.invoke(IPC.themeSet, theme),
  },
  updater: {
    getState: async () => readUpdaterState(await ipcRenderer.invoke(IPC.updaterGetState)),
    onState: (handler) =>
      subscribe(EVENTS.updaterState, (payload) => handler(readUpdaterState(payload))),
    onStateChanged: (handler) =>
      subscribe(EVENTS.updaterState, (payload) => handler(readUpdaterState(payload))),
    check: async () => readUpdaterState(await ipcRenderer.invoke(IPC.updaterCheck)),
    download: () => ipcRenderer.invoke(IPC.updaterDownload),
    install: () => ipcRenderer.invoke(IPC.updaterInstall),
    openRelease: () => ipcRenderer.invoke(IPC.updaterOpenRelease),
  },
  events: {
    subscribe,
    onDeepLink: (handler) => subscribe(EVENTS.deepLink, (payload) => handler(String(payload))),
  },
};

contextBridge.exposeInMainWorld('sovliumDesktop', api);
contextBridge.exposeInMainWorld('__SOVLIUM_NATIVE__', true);
contextBridge.exposeInMainWorld('__SOVLIUM_ELECTRON__', true);
contextBridge.exposeInMainWorld('__SOVLIUM_NATIVE_OS__', nativeOs());
contextBridge.exposeInMainWorld('__SOVLIUM_ELECTRON_SURFACE__', surface());
