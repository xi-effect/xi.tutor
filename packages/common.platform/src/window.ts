import { isDesktopNative, isElectronShell, isNativeShell } from './detect';
import { getSovliumDesktop } from './electron';
import { invokeCommand } from './native';

export interface AppInfo {
  name: string;
  version: string;
  platform: 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown';
  isDebug: boolean;
}

export async function getAppInfo(): Promise<AppInfo> {
  if (!isNativeShell()) {
    return {
      name: 'Sovlium',
      version: '0.0.0',
      platform: 'unknown',
      isDebug: typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV),
    };
  }
  return invokeCommand<AppInfo>('app_info');
}

export async function focusAppWindow(): Promise<void> {
  if (typeof window === 'undefined') return;

  if (isElectronShell()) {
    try {
      const desktop = getSovliumDesktop();
      await desktop?.window.unminimize();
      await desktop?.window.focus();
      return;
    } catch (err) {
      console.warn('[common.platform] focusAppWindow electron failed', err);
    }
  }

  window.focus();
}

export async function onAppFocusChanged(handler: (focused: boolean) => void): Promise<() => void> {
  if (isDesktopNative()) {
    return onMainWindowFocusChanged(handler);
  }
  if (typeof document === 'undefined') return () => undefined;
  const onVisibility = () => {
    handler(document.visibilityState === 'visible');
  };
  document.addEventListener('visibilitychange', onVisibility);
  return () => document.removeEventListener('visibilitychange', onVisibility);
}

export async function onMainWindowFocusChanged(
  handler: (focused: boolean) => void,
): Promise<() => void> {
  if (!isDesktopNative() || !isElectronShell()) return () => undefined;
  const desktop = getSovliumDesktop();
  if (!desktop) return () => undefined;
  return desktop.window.onFocusChanged(handler);
}

export async function isMainWindowMinimized(): Promise<boolean> {
  if (!isDesktopNative() || !isElectronShell()) return false;
  return (await getSovliumDesktop()?.window.isMinimized()) ?? false;
}

export async function unminimizeMainWindow(): Promise<void> {
  if (!isDesktopNative() || !isElectronShell()) return;
  await getSovliumDesktop()?.window.unminimize();
}

export async function setAppTitle(title: string): Promise<void> {
  if (typeof document !== 'undefined') {
    document.title = title;
  }
  if (!isDesktopNative() || !isElectronShell()) return;
  await getSovliumDesktop()?.window.setTitle(title);
}
