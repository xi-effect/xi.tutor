/**
 * Typed wrappers around `invoke`-style Tauri commands exposed by the Rust side
 * (see `src-tauri/src/commands/mod.rs`).
 *
 * Keeping these wrappers in one place ensures that:
 *   - the contract between Rust and TypeScript is documented in a single file,
 *   - command names cannot drift from their Rust definitions silently,
 *   - frontend code never touches the raw `invoke` string API.
 */

import { invoke } from '@tauri-apps/api/core';
import { detectPlatform } from '../platform';

export interface AppInfo {
  name: string;
  version: string;
  platform: 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown';
  isDebug: boolean;
}

/** Returns metadata about the running native shell. Web fallback returns a
 *  best-effort stub so that calling code doesn't have to branch. */
export async function getAppInfo(): Promise<AppInfo> {
  if (detectPlatform() === 'web') {
    return {
      name: 'Sovlium (web preview)',
      version: '0.0.0',
      platform: 'unknown',
      isDebug: import.meta.env.DEV,
    };
  }
  return invoke<AppInfo>('app_info');
}

/** Asks the Rust side to log a diagnostic message. Used as a thin smoke test
 *  during early development; safe to leave in shipped builds. */
export async function logFromRust(message: string): Promise<void> {
  if (detectPlatform() === 'web') return;
  await invoke('log_message', { message });
}
