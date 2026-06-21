type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
};

export function shouldSkipBackgroundPrefetch(): boolean {
  const conn = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  return conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g';
}

export function scheduleIdleTask(task: () => void, timeoutMs = 3000): () => void {
  if (typeof requestIdleCallback !== 'undefined') {
    const id = requestIdleCallback(() => task(), { timeout: timeoutMs });
    return () => cancelIdleCallback(id);
  }

  const id = window.setTimeout(task, 1000);
  return () => clearTimeout(id);
}

export function toHttpOrigin(url: string): string {
  return url.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://');
}

export function ensureResourceHint(
  rel: 'preconnect' | 'dns-prefetch',
  href: string,
  crossOrigin = false,
): void {
  const selector = `link[rel="${rel}"][href="${href}"]`;
  if (document.head.querySelector(selector)) return;

  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}
