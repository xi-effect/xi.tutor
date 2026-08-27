import { isDesktopNative, isNativeShell } from './detect';
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

  if (isDesktopNative()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const current = getCurrentWindow();
      await current.unminimize();
      await current.setFocus();
      return;
    } catch (err) {
      console.warn('[common.platform] focusAppWindow native failed', err);
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
  if (!isDesktopNative()) return () => undefined;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    return getCurrentWindow().onFocusChanged(({ payload }) => {
      handler(payload);
    });
  } catch (err) {
    console.warn('[common.platform] onMainWindowFocusChanged failed', err);
    return () => undefined;
  }
}

export async function isMainWindowMinimized(): Promise<boolean> {
  if (!isDesktopNative()) return false;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    return getCurrentWindow().isMinimized();
  } catch (err) {
    console.warn('[common.platform] isMainWindowMinimized failed', err);
    return false;
  }
}

export async function unminimizeMainWindow(): Promise<void> {
  if (!isDesktopNative()) return;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().unminimize();
  } catch (err) {
    console.warn('[common.platform] unminimizeMainWindow failed', err);
  }
}

export async function setAppTitle(title: string): Promise<void> {
  if (typeof document !== 'undefined') {
    document.title = title;
  }
  if (!isDesktopNative()) return;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().setTitle(title);
  } catch (err) {
    console.warn('[common.platform] setAppTitle native failed', err);
  }
}
