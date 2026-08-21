import { useEffect, useState } from 'react';
import i18n from 'i18next';
import { audioWaveformCache } from '../audioWaveformCache';

export type AudioLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useAudioLoad(blobUrl: string | null) {
  const [waveform, setWaveform] = useState<number[]>([]);
  const [status, setStatus] = useState<AudioLoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!blobUrl) {
      setStatus('idle');
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setError(null);

    (async () => {
      try {
        const wf = await audioWaveformCache.get(blobUrl);
        if (cancelled) return;
        setWaveform(wf);
        setStatus('ready');
      } catch (err) {
        console.error('[AudioPlayer] Load failed:', err);
        if (!cancelled) {
          setError(i18n.t('audio.loadError', { ns: 'editor' }));
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [blobUrl]);

  return { waveform, status, error };
}
