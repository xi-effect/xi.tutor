/**
 * High-level permission helpers.
 *
 * Tauri v2 enforces capability-based permissions declared in
 * `src-tauri/capabilities/*.json`. The frontend cannot widen those bounds at
 * runtime — but it can (and should) request OS-level permissions for plugins
 * such as `notification` before using them.
 */

import { detectPlatform } from '../platform';

export async function ensureNotificationPermission(): Promise<boolean> {
  if (detectPlatform() === 'web') return false;
  // Lazy import keeps the plugin out of the web fallback bundle.
  const plugin = await import('@tauri-apps/plugin-notification');
  let granted = await plugin.isPermissionGranted();
  if (!granted) {
    const status = await plugin.requestPermission();
    granted = status === 'granted';
  }
  return granted;
}
