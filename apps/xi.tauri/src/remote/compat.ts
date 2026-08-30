import { httpProbe } from '../tauri/commands';
import type { NativeCompatManifest } from './types';
import { isShellTooOld } from './semver';

const DEFAULT_TIMEOUT_MS = 4_000;

export type CompatOutcome =
  | { status: 'ok'; manifest: NativeCompatManifest | null }
  | { status: 'missing' }
  | {
      status: 'shell-too-old';
      manifest: NativeCompatManifest;
      shellVersion: string;
    }
  | { status: 'error'; error: string };

function normalizeManifest(raw: unknown): NativeCompatManifest | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const minShellVersion = obj.minShellVersion;
  if (typeof minShellVersion !== 'string' || !minShellVersion.trim()) return null;

  return {
    minShellVersion: minShellVersion.trim(),
    remoteUrl: typeof obj.remoteUrl === 'string' ? obj.remoteUrl : undefined,
    downloadUrl: typeof obj.downloadUrl === 'string' ? obj.downloadUrl : undefined,
    message: typeof obj.message === 'string' ? obj.message : undefined,
  };
}

/**
 * Fetches `/native-compat.json` next to the remote UI via Rust (no CORS).
 * Missing file (404) is treated as "no gate" so older deploys keep working.
 */
export async function fetchCompatManifest(
  remoteOrigin: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{ manifest: NativeCompatManifest | null; missing: boolean; error?: string }> {
  const base = remoteOrigin.replace(/\/$/, '');
  const url = `${base}/native-compat.json`;

  const result = await httpProbe(url, { timeoutMs, includeBody: true });

  if (result.status === 404) {
    return { manifest: null, missing: true };
  }

  if (!result.ok) {
    return {
      manifest: null,
      missing: false,
      error: result.error ?? `compat HTTP ${result.status ?? '?'}`,
    };
  }

  if (!result.body) {
    return { manifest: null, missing: false, error: 'empty native-compat.json' };
  }

  try {
    const json: unknown = JSON.parse(result.body);
    const manifest = normalizeManifest(json);
    if (!manifest) {
      return { manifest: null, missing: false, error: 'invalid native-compat.json' };
    }
    return { manifest, missing: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { manifest: null, missing: false, error: message };
  }
}

export function evaluateCompat(
  shellVersion: string,
  manifest: NativeCompatManifest | null,
): CompatOutcome {
  if (!manifest) return { status: 'ok', manifest: null };
  if (isShellTooOld(shellVersion, manifest.minShellVersion)) {
    return { status: 'shell-too-old', manifest, shellVersion };
  }
  return { status: 'ok', manifest };
}
