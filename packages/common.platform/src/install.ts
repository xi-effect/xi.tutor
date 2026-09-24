import { installNativeMediaAdapters } from './media';
import { refreshNotificationPermission } from './notifications';
import { isElectronShell } from './detect';
import { installElectronCallOverlayShim } from './electronCallOverlay';

let installed = false;

/**
 * One-shot WebView patches used by the native shell.
 * Safe to call from the browser — it no-ops when `__SOVLIUM_NATIVE__` is absent.
 *
 * - camera / mic TCC or OS preflight before `getUserMedia`
 * - Electron call overlay chrome
 * - notification permission hydrate
 */
export function installNativeWebApiBridges(): void {
  if (installed) return;
  installed = true;
  installNativeMediaAdapters();
  if (isElectronShell()) {
    installElectronCallOverlayShim();
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
