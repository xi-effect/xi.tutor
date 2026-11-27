import { useEffect, useRef, useState } from 'react';
import i18n from 'i18next';
import { useYjsContext } from '../../../providers/YjsContext';
import { reportBoardProblem } from '../../../utils/boardProblem';
import { resolveAssetUrl } from '../../../utils/resolveAssetUrl';
import { useRetainedBlobUrl } from '../../../utils/useRetainedBlobUrl';
import {
  audioWaveformCache,
  PLACEHOLDER_WAVEFORM,
  shouldUsePlaceholderWaveform,
} from '../audioWaveformCache';
import type { AudioShape } from '../AudioShape';
import { toPlayableAudioUrl } from '../utils/playableAudioMime';

export type AudioLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

function waitForIdle(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => resolve(), { timeout: 800 });
      return;
    }
    setTimeout(resolve, 200);
  });
}

export function useAudioLoad(shape: AudioShape, shouldLoad: boolean) {
  const { token } = useYjsContext();
  const { src, fileName } = shape.props;

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [status, setStatus] = useState<AudioLoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const loadedKeyRef = useRef<string | null>(null);
  const extraUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!shouldLoad || !src || !token) return;

    const key = `${src}::${token}::${fileName}`;
    if (loadedKeyRef.current === key) return;

    let cancelled = false;
    setStatus('loading');
    setError(null);

    (async () => {
      try {
        const url = await resolveAssetUrl(src, token);
        if (cancelled) return;

        const playable = await toPlayableAudioUrl(url, fileName || '');
        if (cancelled) {
          if (playable !== url) URL.revokeObjectURL(playable);
          return;
        }

        const previousExtra = extraUrlRef.current;
        extraUrlRef.current = playable !== url ? playable : null;
        setBlobUrl(playable);
        if (previousExtra && previousExtra !== playable) {
          // Эффект плеера отпускает старый src после рендера. Раньше revoke обрывал звук.
          setTimeout(() => URL.revokeObjectURL(previousExtra), 0);
        }
        setWaveform(PLACEHOLDER_WAVEFORM);
        loadedKeyRef.current = key;
        setStatus('ready');

        if (shouldUsePlaceholderWaveform()) return;

        await waitForIdle();
        if (cancelled) return;

        const waveformData = await audioWaveformCache.get(url);
        if (!cancelled) setWaveform(waveformData);
      } catch (err) {
        reportBoardProblem('audio-load', err, { shapeId: shape.id });
        if (!cancelled) {
          loadedKeyRef.current = null;
          setError(i18n.t('audio.loadError', { ns: 'board' }));
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, src, token, fileName, shape.id]);

  useRetainedBlobUrl(blobUrl);

  return { blobUrl, waveform, status, error };
}
