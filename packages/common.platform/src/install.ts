import { installNativeMediaAdapters } from './media';
import { refreshNotificationPermission } from './notifications';
import { isDesktopNative } from './detect';
import { installNativeDocumentPipShim } from './documentPipShim';

let installed = false;

/**
 * One-shot WebView patches used by the native shell (desktop and mobile).
 * Safe to call from the browser — it no-ops when `__SOVLIUM_NATIVE__` is absent.
 *
 * - camera / mic TCC or OS preflight before `getUserMedia`
 * - desktop Document PiP stub (not on iOS / Android)
 * - notification permission hydrate
 */
export function installNativeWebApiBridges(): void {
  if (installed) return;
  installed = true;
  installNativeMediaAdapters();
  if (isDesktopNative()) {
    installNativeDocumentPipShim();
  }
  void refreshNotificationPermission();
}

/** @deprecated Use {@link installNativeWebApiBridges}. */
export function installDesktopWebApiBridges(): void {
  installNativeWebApiBridges();
}

/** @internal tests */
export function resetDesktopWebApiBridges(): void {
  installed = false;
}

/** @internal tests */
export function resetNativeWebApiBridges(): void {
  installed = false;
}
