/**
 * Desktop self-update flow.
 *
 * Flow:
 *   1. `check()` — fetches the manifest configured in `tauri.conf.json` ->
 *      `plugins.updater.endpoints`. Tauri verifies the signature against the
 *      embedded `pubkey` before exposing the download.
 *   2. `downloadAndInstall()` — streams the payload and applies it. On macOS
 *      the app replaces itself inside `/Applications`; on Windows the NSIS /
 *      MSI updater is invoked.
 *   3. `relaunch()` from `@tauri-apps/plugin-process` restarts the shell.
 *
 * Mobile platforms (iOS / Android) intentionally do NOT use this module —
 * store updates are mandated by the platform owners.
 */

import { detectPlatform } from '../platform';

export interface UpdateCheckOptions {
  /** When true, do not show user-visible UI on success/failure. Used for the
   *  automatic background check at startup. */
  silent?: boolean;
}

export interface UpdateOutcome {
  status: 'up-to-date' | 'updated' | 'failed' | 'unsupported';
  version?: string;
  error?: string;
}

export async function checkAndApplyUpdate(opts: UpdateCheckOptions = {}): Promise<UpdateOutcome> {
  if (detectPlatform() !== 'desktop') {
    return { status: 'unsupported' };
  }

  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    const update = await check();

    if (!update) {
      return { status: 'up-to-date' };
    }

    let downloaded = 0;
    let contentLength = 0;
    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data.contentLength ?? 0;
          break;
        case 'Progress':
          downloaded += event.data.chunkLength;
          if (!opts.silent) {
            // Defer to a higher-level UI layer (toast / banner) via window event.
            window.dispatchEvent(
              new CustomEvent('sovlium:update-progress', {
                detail: { downloaded, total: contentLength },
              }),
            );
          }
          break;
        case 'Finished':
          break;
      }
    });

    // After install Tauri schedules the relaunch, but we make it explicit so
    // it's observable from the UI (giving us a chance to confirm with the user).
    const { relaunch } = await import('@tauri-apps/plugin-process');
    window.dispatchEvent(
      new CustomEvent('sovlium:update-ready', { detail: { version: update.version } }),
    );

    if (!opts.silent) {
      // When the check was user-initiated, relaunch immediately; otherwise we
      // let the UI surface a "Restart now" CTA.
      await relaunch();
    }

    return { status: 'updated', version: update.version };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!opts.silent) {
      window.dispatchEvent(new CustomEvent('sovlium:update-error', { detail: { error: message } }));
    }
    return { status: 'failed', error: message };
  }
}

/** Restart the app. Exposed for the "Restart now" CTA after a silent update. */
export async function applyPendingRestart(): Promise<void> {
  if (detectPlatform() !== 'desktop') return;
  const { relaunch } = await import('@tauri-apps/plugin-process');
  await relaunch();
}
