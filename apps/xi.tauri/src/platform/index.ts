/**
 * Runtime platform detection and bootstrap.
 *
 * The Tauri shell can run in three distinct contexts:
 *   - `desktop` — Windows / macOS / Linux (full Tauri capabilities + updater).
 *   - `mobile`  — iOS / Android (Tauri capabilities minus desktop-only plugins;
 *                 updates go through App Store / Play Store).
 *   - `web`     — fallback path used when `vite dev` is launched without the
 *                 Tauri host (developer browser), or in a future browser-only
 *                 deployment of this shell.
 *
 * `initPlatform` MUST be called once during application bootstrap, before the
 * React tree mounts, so that platform-specific side effects (window controls,
 * deep links, updater) are registered with a stable lifecycle.
 */

import type { PlatformKind, PlatformModule } from './types';

export type { PlatformKind, PlatformModule } from './types';

let cached: PlatformModule | null = null;

export function detectPlatform(): PlatformKind {
  // Tauri injects this global on both desktop and mobile. We avoid `@tauri-apps/api`
  // here to keep this check synchronous and side-effect free.
  const isTauri =
    typeof window !== 'undefined' &&
    '__TAURI_INTERNALS__' in (window as unknown as Record<string, unknown>);

  if (!isTauri) return 'web';

  // Use UA to disambiguate desktop vs mobile inside Tauri. WKWebView and
  // Android WebView both surface a recognisable UA, while desktop WebViews
  // (WebView2 / WebKitGTK) do not include mobile markers.
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return 'mobile';
  return 'desktop';
}

export async function initPlatform(): Promise<PlatformModule> {
  if (cached) return cached;
  const kind = detectPlatform();

  const mod: PlatformModule =
    kind === 'desktop'
      ? (await import('./desktop')).default
      : kind === 'mobile'
        ? (await import('./mobile')).default
        : (await import('./web')).default;

  await mod.init();
  cached = mod;
  return mod;
}

export function getPlatform(): PlatformModule {
  if (!cached) {
    throw new Error(
      'Platform layer is not initialised. Call initPlatform() before accessing getPlatform().',
    );
  }
  return cached;
}
