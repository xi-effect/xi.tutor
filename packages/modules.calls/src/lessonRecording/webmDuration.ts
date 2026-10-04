type FixWebmDuration = {
  (blob: Blob, durationMs: number, options?: { logger?: false }): Promise<Blob>;
};

/** MediaRecorder не пишет длительность в WebM, и плеер показывает 0:00 при живом файле. */
export async function withWebmDuration(blob: Blob, durationMs: number): Promise<Blob> {
  if (durationMs <= 0 || blob.size === 0) return blob;
  if (blob.type && !blob.type.includes('webm')) return blob;
  try {
    const mod = (await import('fix-webm-duration')) as { default: FixWebmDuration };
    const fix = mod.default;
    return await fix(blob, durationMs, { logger: false });
  } catch {
    return blob;
  }
}
