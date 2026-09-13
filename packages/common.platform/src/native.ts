import { isElectronShell, isNativeShell, isTauriShell } from './detect';
import { getSovliumDesktop } from './electron';
import type { CallPipSize } from './callPip';
import type { MediaPermissionKind } from './media';
import type { ShellTheme } from './theme';
import type { SaveFileRequest } from './electron-api';

async function invokeElectron<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const desktop = getSovliumDesktop();
  if (!desktop) {
    throw new Error('[common.platform] sovliumDesktop is not available');
  }

  switch (command) {
    case 'app_info':
      return desktop.app.getInfo() as Promise<T>;
    case 'save_file':
      return desktop.files.save(args as unknown as SaveFileRequest) as Promise<T>;
    case 'share_overlay_show':
      return desktop.screenShare.openControls() as Promise<T>;
    case 'share_overlay_hide':
      return desktop.screenShare.closeControls() as Promise<T>;
    case 'share_overlay_focus_main':
      return desktop.screenShare.focusMain() as Promise<T>;
    case 'share_overlay_request_stop':
      return desktop.screenShare.requestStop() as Promise<T>;
    case 'call_pip_enter':
      return desktop.conference.enterFloatingMode(args as unknown as CallPipSize) as Promise<T>;
    case 'call_pip_leave':
      return desktop.conference.exitFloatingMode() as Promise<T>;
    case 'call_pip_resize':
      return desktop.conference.resizeFloating(args as unknown as CallPipSize) as Promise<T>;
    case 'media_permission_status':
      return desktop.permissions.status(args?.kind as MediaPermissionKind) as Promise<T>;
    case 'media_permission_request':
      return desktop.permissions.request(args?.kind as MediaPermissionKind) as Promise<T>;
    case 'get_shell_theme':
      return desktop.theme.get() as Promise<T>;
    case 'set_shell_theme':
      return desktop.theme.set(args?.theme as ShellTheme) as Promise<T>;
    default:
      throw new Error(`[common.platform] unsupported Electron command: ${command}`);
  }
}

export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  if (isElectronShell()) {
    return invokeElectron<T>(command, args);
  }
  if (isTauriShell()) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(command, args);
  }
  throw new Error(`[common.platform] ${command} is only available in the native shell`);
}

export async function listenCommand<T>(
  event: string,
  handler: (payload: T) => void,
): Promise<() => void> {
  if (isElectronShell()) {
    const desktop = getSovliumDesktop();
    if (!desktop) return () => undefined;
    if (event === 'share-overlay-stop') {
      return desktop.screenShare.onStop(() => handler(undefined as T));
    }
    if (event === 'share-annotate-stroke') {
      return desktop.screenShare.onAnnotation((payload) => handler(payload as T));
    }
    if (event === 'call-pip-restored') {
      return desktop.events.subscribe(event, () => handler(undefined as T));
    }
    return desktop.events.subscribe(event, (payload) => handler(payload as T));
  }
  if (isTauriShell()) {
    const { listen } = await import('@tauri-apps/api/event');
    const unlisten = await listen<T>(event, (e) => {
      handler(e.payload);
    });
    return unlisten;
  }
  return () => undefined;
}

export function assertNativeAvailable(apiName: string): void {
  if (!isNativeShell()) {
    throw new Error(`[common.platform] ${apiName} is only available in the native shell`);
  }
}
