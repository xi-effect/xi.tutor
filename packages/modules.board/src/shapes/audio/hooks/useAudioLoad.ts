import { useEffect, useState } from 'react';
import { useYjsContext } from '../../../providers/YjsProvider';
import { resolveAssetUrl } from '../../../utils/resolveAssetUrl';
import { audioWaveformCache } from '../audioWaveformCache';
import type { AudioShape } from '../AudioShape';

export function useAudioLoad(shape: AudioShape) {
  const { token } = useYjsContext();
  const { src } = shape.props;

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!src || !token) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const url = await resolveAssetUrl(src, token);
        if (cancelled) return;
        setBlobUrl(url);

        const wf = await audioWaveformCache.get(url);
        if (!cancelled) setWaveform(wf);

        setLoading(false);
      } catch (err) {
        console.error('[AudioPlayer] Load failed:', err);
        if (!cancelled) {
          setError('Не удалось загрузить аудио');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src, token]);

  return { blobUrl, waveform, loading, error };
}
