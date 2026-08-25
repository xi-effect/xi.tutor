import { installNativeMediaAdapters } from './media';
import { refreshNotificationPermission } from './notifications';

let installed = false;

/**
 * One-shot WebView patches used by the desktop shell. Safe to call from the
 * browser — it no-ops when `__SOVLIUM_NATIVE__` is absent.
 */
export function installDesktopWebApiBridges(): void {
  if (installed) return;
  installed = true;
  installNativeMediaAdapters();
  void refreshNotificationPermission();
}

/** @internal tests */
export function resetDesktopWebApiBridges(): void {
  installed = false;
}
