import { useEffect, useState } from 'react';
import { useYjsContext } from '../../../providers/YjsProvider';
import { resolveAssetUrl } from '../../../utils/resolveAssetUrl';
import { audioWaveformCache } from '../audioWaveformCache';
import type { AudioShape } from '../AudioShape';
import i18n from 'i18next';

export type AudioLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useAudioLoad(shape: AudioShape, shouldLoad: boolean) {
  const { token } = useYjsContext();
  const { src } = shape.props;

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [status, setStatus] = useState<AudioLoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldLoad || !src || !token) return;
    if (status === 'ready' || status === 'loading') return;

    let cancelled = false;

    (async () => {
      try {
        setStatus('loading');
        const url = await resolveAssetUrl(src, token);
        if (cancelled) return;
        setBlobUrl(url);

        const wf = await audioWaveformCache.get(url);
        if (!cancelled) setWaveform(wf);

        setStatus('ready');
      } catch (err) {
        console.error('[AudioPlayer] Load failed:', err);
        if (!cancelled) {
          setError(i18n.t('audio.loadError', { ns: 'board' }));
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, src, token]);

  return { blobUrl, waveform, status, error };
}
