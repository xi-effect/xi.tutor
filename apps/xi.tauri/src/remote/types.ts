/** Manifest served by the remote UI host (`/native-compat.json`). */
export interface NativeCompatManifest {
  /** Minimum shell version (semver) required to load this remote UI. */
  minShellVersion: string;
  /** Preferred remote UI origin (optional override of shell defaults). */
  remoteUrl?: string;
  /** Where the user can download a newer shell if this one is too old. */
  downloadUrl?: string;
  /** Optional human-readable note shown on the update-required screen. */
  message?: string;
}

export type RemoteBootFailureKind = 'offline' | 'unreachable' | 'compat' | 'timeout' | 'unknown';

export interface RemoteBootFailure {
  kind: RemoteBootFailureKind;
  message: string;
  downloadUrl?: string;
  detail?: string;
}
