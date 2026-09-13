import { contextBridge, ipcRenderer } from 'electron';
import { EVENTS, IPC } from '../shared/channels';
import type {
  ConferenceState,
  MediaPermissionKind,
  SlotBounds,
  SovliumDesktopAPI,
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
  },
  files: {
    save: (request) => ipcRenderer.invoke(IPC.filesSave, request),
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
