/**
 * Minimal semver compare for shell/compat gates.
 * Accepts `1.2.3`, `1.2.3-beta`, `v1.2.3` — prerelease suffix is ignored.
 */
export function parseSemver(raw: string): [number, number, number] | null {
  const cleaned = raw.trim().replace(/^v/i, '');
  const core = cleaned.split('-')[0]?.split('+')[0] ?? '';
  const parts = core.split('.');
  if (parts.length < 2) return null;

  const major = Number(parts[0]);
  const minor = Number(parts[1]);
  const patch = Number(parts[2] ?? '0');
  if (![major, minor, patch].every((n) => Number.isFinite(n) && n >= 0)) {
    return null;
  }
  return [major, minor, patch];
}

/** Returns negative if `a < b`, 0 if equal, positive if `a > b`. */
export function compareSemver(a: string, b: string): number {
  const left = parseSemver(a);
  const right = parseSemver(b);
  if (!left || !right) return 0;
  for (let i = 0; i < 3; i += 1) {
    const diff = left[i]! - right[i]!;
    if (diff !== 0) return diff;
  }
  return 0;
}

export function isShellTooOld(shellVersion: string, minShellVersion: string): boolean {
  return compareSemver(shellVersion, minShellVersion) < 0;
}
