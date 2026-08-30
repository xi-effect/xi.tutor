/**
 * High-level permission helpers.
 *
 * Tauri v2 enforces capability-based permissions declared in
 * `src-tauri/capabilities/*.json`. The frontend cannot widen those bounds at
 * runtime — but it can (and should) request OS-level permissions for plugins
 * such as `notification` before using them.
 *
 * Remote UI uses the same helpers via `common.platform`.
 */

import { isNativeShell, requestNotificationPermission } from 'common.platform';

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!isNativeShell()) return false;
  const status = await requestNotificationPermission();
  return status === 'granted';
}
