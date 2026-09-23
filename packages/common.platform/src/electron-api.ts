export type NativeOs = 'macos' | 'windows' | 'linux' | 'ios' | 'android' | 'unknown';
export type ConferencePresentation = 'hidden' | 'inline' | 'floating';

export interface AppInfo {
  name: string;
  version: string;
  platform: NativeOs;
  isDebug: boolean;
}

export interface SlotBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ShareSource {
  id: string;
  name: string;
  kind: 'screen' | 'window';
  displayId: string | null;
  /** data: URL, empty when the OS returned no preview. */
  thumbnail: string;
  appIcon: string | null;
}

/** Pixel size of the captured screen-share track; used to find the shared display. */
export interface ShareCaptureSize {
  width: number;
  height: number;
}

export type RemoteMouseButton = 'left' | 'right' | 'middle';
/** Platform of the controlling participant: the shortcut key is Cmd there, Ctrl elsewhere. */
export type RemoteOrigin = 'mac' | 'other';

export interface RemoteModifiers {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}

/** Remote-control input; `x`/`y` are 0..1 across the shared display. */
export type RemoteInput =
  | { type: 'move'; x: number; y: number }
  | {
      type: 'button';
      x: number;
      y: number;
      button: RemoteMouseButton;
      down: boolean;
      clicks: number;
      mods: RemoteModifiers;
      origin: RemoteOrigin;
    }
  | { type: 'wheel'; dx: number; dy: number }
  | { type: 'text'; text: string }
  | { type: 'key'; key: string; mods: RemoteModifiers; origin: RemoteOrigin };

export interface RemoteControlStatus {
  /** Input injection is available on this OS and the native module loaded. */
  supported: boolean;
  /** macOS Accessibility permission; always `true` elsewhere. */
  trusted: boolean;
}

export interface ConferenceState {
  active: boolean;
  classroomId: string | null;
  presentation: ConferencePresentation;
  floating: boolean;
}

export interface SaveFileRequest {
  defaultName: string;
  contentsBase64: string;
}

export type MediaPermissionKind = 'camera' | 'microphone' | 'screen';
export type MediaPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';
export type ShellTheme = 'light' | 'dark';
export type DesktopNotificationPermission = 'granted' | 'denied' | 'default';

export type UpdaterStatus =
  'checking' | 'available' | 'downloading' | 'downloaded' | 'not-available' | 'error';

/** Safe updater snapshot from the Electron main process. */
export interface UpdaterState {
  status: UpdaterStatus;
  version: string | null;
  percent: number | null;
  releaseUrl: string | null;
  /** Windows: the package is downloaded and quitAndInstall is allowed. */
  canInstall: boolean;
  message: string | null;
}

export interface SovliumDesktopAPI {
  app: {
    getInfo(): Promise<AppInfo>;
    getPlatform(): Promise<NativeOs>;
    getVersion(): Promise<string>;
  };
  window: {
    minimize(): Promise<void>;
    maximize(): Promise<void>;
    close(): Promise<void>;
    focus(): Promise<void>;
    unminimize(): Promise<void>;
    isMinimized(): Promise<boolean>;
    setTitle(title: string): Promise<void>;
    onFocusChanged(handler: (focused: boolean) => void): () => void;
  };
  conference: {
    start(input: { classroomId: string }): Promise<ConferenceState>;
    leave(): Promise<void>;
    setSlotBounds(bounds: SlotBounds | null): Promise<void>;
    enterFloatingMode(size?: {
      width: number;
      height: number;
    }): Promise<{ width: number; height: number }>;
    exitFloatingMode(): Promise<void>;
    resizeFloating(size: {
      width: number;
      height: number;
    }): Promise<{ width: number; height: number }>;
    getState(): Promise<ConferenceState>;
    notifyEnded(): Promise<void>;
    onStateChanged(handler: (state: ConferenceState) => void): () => void;
  };
  screenShare: {
    openControls(): Promise<void>;
    closeControls(): Promise<void>;
    focusMain(): Promise<void>;
    requestStop(): Promise<void>;
    onStop(handler: () => void): () => void;
    onAnnotation(handler: (payload: unknown) => void): () => void;
    listSources(): Promise<ShareSource[]>;
    selectSource(id: string | null): Promise<void>;
    layoutAnnotations(capture: ShareCaptureSize | null): Promise<void>;
    setAnnotationDrawing(enabled: boolean): Promise<void>;
    setToolbarSize(size: { width: number; height: number }): Promise<void>;
  };
  remoteControl: {
    status(): Promise<RemoteControlStatus>;
    requestAccess(): Promise<RemoteControlStatus>;
    setActive(enabled: boolean): Promise<void>;
    input(event: RemoteInput): void;
  };
  files: {
    save(request: SaveFileRequest): Promise<boolean>;
  };
  notifications: {
    status(): Promise<DesktopNotificationPermission>;
    request(): Promise<DesktopNotificationPermission>;
    show(input: { title: string; body: string; url?: string }): Promise<boolean>;
    onClicked(handler: (url: string) => void): () => void;
  };
  clipboard: {
    writeText(text: string): Promise<void>;
    readText(): Promise<string>;
    writeHtml(html: string, text: string): Promise<void>;
    readHtml(): Promise<string>;
  };
  power: {
    setDisplaySleepBlocked(enabled: boolean): Promise<void>;
  };
  external: {
    openUrl(url: string): Promise<void>;
  };
  permissions: {
    status(kind: MediaPermissionKind): Promise<MediaPermissionStatus>;
    request(kind: MediaPermissionKind): Promise<MediaPermissionStatus>;
  };
  theme: {
    get(): Promise<ShellTheme>;
    set(theme: ShellTheme): Promise<void>;
  };
  updater: {
    getState(): Promise<UpdaterState>;
    onState(handler: (state: UpdaterState) => void): () => void;
    /** Windows: quit and run the downloaded installer. No-op unless `canInstall`. */
    install(): Promise<boolean>;
    /** macOS: open the GitHub Release page for the detected version. */
    openRelease(): Promise<boolean>;
  };
  events: {
    subscribe(channel: string, handler: (payload: unknown) => void): () => void;
    onDeepLink(handler: (path: string) => void): () => void;
  };
}

declare global {
  interface Window {
    __SOVLIUM_NATIVE__?: boolean;
    __SOVLIUM_NATIVE_OS__?: string;
    __SOVLIUM_ELECTRON__?: boolean;
    __SOVLIUM_ELECTRON_SURFACE__?: 'main' | 'conference';
    __TAURI_INTERNALS__?: unknown;
    sovliumDesktop?: SovliumDesktopAPI;
  }
}

export {};
