import { isMemoryConstrainedDevice } from '../../utils/deviceBudget';

const NUM_BARS = 50;

const cache = new Map<string, number[]>();
const pending = new Map<string, Promise<number[]>>();

/** Ровная «гребёнка», когда полный decode на телефоне слишком дорог. */
export const PLACEHOLDER_WAVEFORM: number[] = Array.from({ length: NUM_BARS }, (_, index) => {
  const amp = 0.32 + 0.5 * Math.abs(Math.sin(index * 0.62 + 0.3));
  return Math.round(amp * 100) / 100;
});

/**
 * Полный PCM-decode держит в памяти вторую копию файла.
 * На iPhone и iPad из-за этого вкладку убивает система, а звук обрывается.
 */
export function shouldUsePlaceholderWaveform(): boolean {
  if (isMemoryConstrainedDevice()) return true;
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

async function computeWaveform(blobUrl: string): Promise<number[]> {
  const response = await fetch(blobUrl);
  const arrayBuffer = await response.arrayBuffer();

  if (typeof OfflineAudioContext === 'undefined') {
    throw new Error('OfflineAudioContext is not available');
  }

  // Offline-контекст не занимает динамики и не требует жеста, в отличие от AudioContext.
  const audioCtx = new OfflineAudioContext(1, 1, 44100);
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    if (channelData.length === 0) throw new Error('empty audio');
    const samplesPerBar = Math.max(1, Math.floor(channelData.length / NUM_BARS));
    const bars: number[] = [];

    for (let i = 0; i < NUM_BARS; i++) {
      let sum = 0;
      const start = i * samplesPerBar;
      const end = Math.min(start + samplesPerBar, channelData.length);
      if (end <= start) {
        bars.push(0.08);
        continue;
      }

      for (let j = start; j < end; j++) {
        sum += Math.abs(channelData[j]);
      }

      bars.push(sum / (end - start));
    }

    const max = Math.max(...bars, 0.001);
    return bars.map((v) => Math.max(0.08, v / max));
  } finally {
    // OfflineAudioContext не имеет close() в части браузеров.
    await (audioCtx as unknown as { close?: () => Promise<void> }).close?.();
  }
}

export const audioWaveformCache = {
  async get(blobUrl: string): Promise<number[]> {
    const cached = cache.get(blobUrl);
    if (cached) return cached;

    const pendingResult = pending.get(blobUrl);
    if (pendingResult) return pendingResult;

    const promise = computeWaveform(blobUrl)
      .then((result) => {
        cache.set(blobUrl, result);
        pending.delete(blobUrl);
        return result;
      })
      .catch(() => {
        pending.delete(blobUrl);
        cache.set(blobUrl, PLACEHOLDER_WAVEFORM);
        return PLACEHOLDER_WAVEFORM;
      });

    pending.set(blobUrl, promise);
    return promise;
  },
};
