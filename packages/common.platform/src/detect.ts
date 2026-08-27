export type RuntimeKind = 'web' | 'desktop' | 'mobile';
export type NativeOs = 'macos' | 'windows' | 'linux' | 'ios' | 'android' | 'unknown';

const NATIVE_OS_VALUES = new Set<NativeOs>(['macos', 'windows', 'linux', 'ios', 'android']);

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

function maxTouchPoints(): number {
  const nav = (globalThis as { navigator?: { maxTouchPoints?: number } }).navigator;
  return nav?.maxTouchPoints ?? 0;
}

function injectedNativeOs(): NativeOs | null {
  const g = host();
  const raw = g?.__SOVLIUM_NATIVE_OS__;
  if (typeof raw !== 'string') return null;
  return NATIVE_OS_VALUES.has(raw as NativeOs) ? (raw as NativeOs) : null;
}

/**
 * True when the UI runs inside the Sovlium native shell (local bundle or
 * remote `*.sovlium.ru` loaded in the Tauri WebView).
 *
 * Production navigates to the web origin, so `__SOVLIUM_NATIVE__`
 * (injected by the shell) is the reliable signal — not the document origin.
 */
export function isNativeShell(): boolean {
  const g = host();
  if (!g) return false;
  return Boolean(g.__SOVLIUM_NATIVE__ || g.__TAURI_INTERNALS__);
}

/**
 * iPhone / iPad / Android (phones and tablets) inside the native shell.
 *
 * Prefers `__SOVLIUM_NATIVE_OS__` from the shell init script: iPadOS 13+
 * WKWebView often reports a Macintosh UA, which would otherwise look desktop.
 */
export function isMobileNative(): boolean {
  if (!isNativeShell()) return false;
  const os = injectedNativeOs();
  if (os === 'ios' || os === 'android') return true;
  if (os === 'macos' || os === 'windows' || os === 'linux') return false;

  const ua = userAgent();
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return true;
  // iPadOS desktop-UA spoof.
  return /Macintosh/i.test(ua) && maxTouchPoints() > 1;
}

export function isDesktopNative(): boolean {
  return isNativeShell() && !isMobileNative();
}

/** iPad, or Android without "Mobile" in the UA (typical tablet). */
export function isTabletNative(): boolean {
  if (!isMobileNative()) return false;
  const os = getNativeOs();
  const ua = userAgent();
  if (os === 'ios') {
    return /iPad/i.test(ua) || (/Macintosh/i.test(ua) && maxTouchPoints() > 1);
  }
  if (os === 'android') {
    return /Android/i.test(ua) && !/Mobile/i.test(ua);
  }
  return false;
}

export function getRuntimeKind(): RuntimeKind {
  if (!isNativeShell()) return 'web';
  return isMobileNative() ? 'mobile' : 'desktop';
}

export function getNativeOs(): NativeOs {
  if (!isNativeShell()) return 'unknown';
  const injected = injectedNativeOs();
  if (injected) return injected;

  const ua = userAgent();
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && maxTouchPoints() > 1)) {
    return 'ios';
  }
  if (/Android/i.test(ua)) return 'android';
  if (/Mac OS X|Macintosh/i.test(ua)) return 'macos';
  if (/Windows/i.test(ua)) return 'windows';
  if (/Linux/i.test(ua)) return 'linux';
  return 'unknown';
}
