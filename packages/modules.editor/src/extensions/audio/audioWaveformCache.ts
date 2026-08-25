const NUM_BARS = 50;

const cache = new Map<string, number[]>();
const pending = new Map<string, Promise<number[]>>();

async function computeWaveform(blobUrl: string): Promise<number[]> {
  const response = await fetch(blobUrl);
  const arrayBuffer = await response.arrayBuffer();

  const audioCtx = new AudioContext();
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const samplesPerBar = Math.floor(channelData.length / NUM_BARS);
    const bars: number[] = [];

    for (let i = 0; i < NUM_BARS; i++) {
      let sum = 0;
      const start = i * samplesPerBar;
      const end = Math.min(start + samplesPerBar, channelData.length);

      for (let j = start; j < end; j++) {
        sum += Math.abs(channelData[j]);
      }

      bars.push(sum / (end - start));
    }

    const max = Math.max(...bars, 0.001);
    return bars.map((v) => Math.max(0.08, v / max));
  } finally {
    await audioCtx.close();
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
        const fallback = Array(NUM_BARS).fill(0.3) as number[];
        cache.set(blobUrl, fallback);
        return fallback;
      });

    pending.set(blobUrl, promise);
    return promise;
  },
};
