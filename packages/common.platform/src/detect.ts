export type RuntimeKind = 'web' | 'desktop' | 'mobile';
export type NativeOs = 'macos' | 'windows' | 'linux' | 'ios' | 'android' | 'unknown';

function host(): Record<string, unknown> | null {
  if (typeof globalThis === 'undefined') return null;
  const g = globalThis as unknown as Record<string, unknown>;
  const win = g.window;
  if (win && typeof win === 'object') return win as Record<string, unknown>;
  return g;
}

function userAgent(): string {
  const nav = (globalThis as { navigator?: { userAgent?: string } }).navigator;
  return nav?.userAgent ?? '';
}

/**
 * True when the UI runs inside the Sovlium native shell (local bundle or
 * remote `*.sovlium.ru` loaded in the Tauri WebView).
 *
 * Production desktop navigates to the web origin, so `__SOVLIUM_NATIVE__`
 * (injected by the shell) is the reliable signal — not the document origin.
 */
export function isNativeShell(): boolean {
  const g = host();
  if (!g) return false;
  return Boolean(g.__SOVLIUM_NATIVE__ || g.__TAURI_INTERNALS__);
}

export function isMobileNative(): boolean {
  if (!isNativeShell()) return false;
  return /iPhone|iPad|iPod|Android/i.test(userAgent());
}

export function isDesktopNative(): boolean {
  return isNativeShell() && !isMobileNative();
}

export function getRuntimeKind(): RuntimeKind {
  if (!isNativeShell()) return 'web';
  return isMobileNative() ? 'mobile' : 'desktop';
}

export function getNativeOs(): NativeOs {
  if (!isNativeShell()) return 'unknown';
  const ua = userAgent();
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Mac OS X|Macintosh/i.test(ua)) return 'macos';
  if (/Windows/i.test(ua)) return 'windows';
  if (/Linux/i.test(ua)) return 'linux';
  return 'unknown';
}
