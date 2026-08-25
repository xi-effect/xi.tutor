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
