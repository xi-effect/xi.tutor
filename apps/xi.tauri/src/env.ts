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

export const tauriShellEnv = {
  /** Optional canary URL. When set, the WebView loads this URL instead of the
   *  locally bundled frontend (`tauri.conf.json.build.frontendDist`). */
  remoteUrl: import.meta.env.VITE_TAURI_REMOTE_URL ?? null,

  /** Whether the desktop updater should auto-check on startup. Defaults to true
   *  in release builds. Has no effect on mobile (App Store / Play Store handle
   *  updates). */
  updaterAutoCheck: parseBool(import.meta.env.VITE_TAURI_UPDATER_AUTOCHECK, true),
};

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}
