/**
 * Environment helpers for the Tauri shell.
 *
 * Two layers of env exist in this app:
 *   1. Vite-level env (`import.meta.env.VITE_*`) — same schema as `xi.web`, reused
 *      via `common.env` so that bundled frontend code keeps working unchanged.
 *   2. Tauri-level env (`TAURI_ENV_*`) — injected by the Tauri CLI during
 *      `tauri dev|build` and at runtime via `@tauri-apps/api/core` `getName`,
 *      `getVersion`, `os.platform` etc.
 *
 * This module exposes only the Tauri-shell-specific knobs. The web env stays
 * the single source of truth for API URLs and feature flags.
 */

const DEFAULT_REMOTE_URL = 'https://app.sovlium.ru';
const DEFAULT_REMOTE_FALLBACK_URL = 'https://desktop.sovlium.ru';

function parseRemoteMode(): boolean {
  // Empty URL string is an explicit "stay on local frontendDist".
  if (import.meta.env.VITE_TAURI_REMOTE_URL === '') return false;

  const explicit = import.meta.env.VITE_TAURI_REMOTE_MODE;
  if (explicit !== undefined && explicit !== '') {
    return parseBool(explicit, true);
  }

  // Production installers default to remote UI (same-site cookies with API).
  // `tauri:dev` forces local via `dev:frontend` (VITE_TAURI_REMOTE_MODE=false).
  return import.meta.env.PROD;
}

export const tauriShellEnv = {
  /**
   * When true, the shell boots a local splash and then navigates to a remote
   * UI under `*.sovlium.ru` (same-site cookies with the API). Default: on.
   * Set `VITE_TAURI_REMOTE_MODE=false` (or empty `VITE_TAURI_REMOTE_URL`) for
   * a fully local `frontendDist` bundle.
   */
  remoteMode: parseRemoteMode(),

  /** Primary remote UI origin. */
  remoteUrl: (() => {
    const raw = import.meta.env.VITE_TAURI_REMOTE_URL;
    if (raw === '') return null;
    return raw ?? DEFAULT_REMOTE_URL;
  })(),

  /** Secondary origin tried when the primary health check fails. */
  remoteFallbackUrl: (() => {
    const raw = import.meta.env.VITE_TAURI_REMOTE_FALLBACK_URL;
    if (raw === '') return null;
    return raw ?? DEFAULT_REMOTE_FALLBACK_URL;
  })(),

  /** Per-request timeout for health / compat probes (ms). */
  remoteTimeoutMs: parseIntEnv(import.meta.env.VITE_TAURI_REMOTE_TIMEOUT_MS, 5_000),

  /** Whether the desktop updater should auto-check on startup. Defaults to true
   *  in release builds. Has no effect on mobile (App Store / Play Store handle
   *  updates). */
  updaterAutoCheck: parseBool(import.meta.env.VITE_TAURI_UPDATER_AUTOCHECK, true),

  /** TEMP: send `X-Testing: true` so xi.back-2 creates `is_cross_site` sessions
   *  (`SameSite=None`). Off by default — enable only for native auth experiments
   *  against a local `tauri://` / localhost bundle. Useless in remote mode. */
  crossSiteSessionProbe: parseBool(import.meta.env.VITE_TAURI_CROSS_SITE_SESSION_PROBE, false),
};

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

function parseIntEnv(value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
