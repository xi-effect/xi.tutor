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
import { getAppInfo as getPlatformAppInfo, type AppInfo as PlatformAppInfo } from 'common.platform';
import { detectPlatform } from '../platform';

export type AppInfo = PlatformAppInfo;

export interface HttpProbeResult {
  ok: boolean;
  status?: number | null;
  body?: string | null;
  error?: string | null;
}

/** Returns metadata about the running native shell. Web fallback returns a
 *  best-effort stub so that calling code doesn't have to branch. */
export async function getAppInfo(): Promise<AppInfo> {
  return getPlatformAppInfo();
}

/** Asks the Rust side to log a diagnostic message. Used as a thin smoke test
 *  during early development; safe to leave in shipped builds. */
export async function logFromRust(message: string): Promise<void> {
  if (detectPlatform() === 'web') return;
  await invoke('log_message', { message });
}

/**
 * Server-side HTTP GET (no WebView CORS). Used by the remote splash to probe
 * `*.sovlium.ru` while the document is still on `tauri://` / localhost.
 */
export async function httpProbe(
  url: string,
  opts: { timeoutMs?: number; includeBody?: boolean } = {},
): Promise<HttpProbeResult> {
  if (detectPlatform() === 'web') {
    // Browser preview: best-effort CORS fetch.
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), opts.timeoutMs ?? 5_000);
      try {
        const response = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });
        const body = opts.includeBody && response.ok ? await response.text() : null;
        return {
          ok: response.ok || (response.status >= 300 && response.status < 400),
          status: response.status,
          body,
        };
      } finally {
        window.clearTimeout(timer);
      }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return invoke<HttpProbeResult>('http_probe', {
    url,
    timeoutMs: opts.timeoutMs ?? null,
    includeBody: opts.includeBody ?? null,
  });
}
