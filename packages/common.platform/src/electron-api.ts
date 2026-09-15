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
