import { isElectronShell } from './detect';
import './electron-api';
import type { SovliumDesktopAPI } from './electron-api';

export function getSovliumDesktop(): SovliumDesktopAPI | null {
  if (typeof window === 'undefined') return null;
  return window.sovliumDesktop ?? null;
}

export function requireSovliumDesktop(apiName: string): SovliumDesktopAPI {
  const api = getSovliumDesktop();
  if (!api || !isElectronShell()) {
    throw new Error(`[common.platform] ${apiName} requires the Electron shell`);
  }
  return api;
}
