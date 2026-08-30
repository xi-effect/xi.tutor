import { httpProbe } from '../tauri/commands';

const DEFAULT_TIMEOUT_MS = 5_000;

export interface HealthCheckResult {
  ok: boolean;
  url: string;
  status?: number;
  error?: string;
}

/** Probes a remote UI origin via the Rust HTTP client (no WebView CORS). */
export async function probeRemoteUrl(
  url: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<HealthCheckResult> {
  const result = await httpProbe(url, { timeoutMs, includeBody: false });
  return {
    ok: result.ok,
    url,
    status: result.status ?? undefined,
    error: result.error ?? undefined,
  };
}

/** Tries candidates in order; returns the first healthy URL. */
export async function pickHealthyRemoteUrl(
  candidates: string[],
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{ url: string } | { failures: HealthCheckResult[] }> {
  const failures: HealthCheckResult[] = [];
  for (const candidate of candidates) {
    const result = await probeRemoteUrl(candidate, timeoutMs);
    if (result.ok) return { url: candidate };
    failures.push(result);
  }
  return { failures };
}
