import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LOADER_FADE_MS, LOADER_TIMEOUT_MS } from './consts';

type EmbedLoadingFrameProps = { w: number; h: number; children: ReactNode };

export const EmbedLoadingFrame = ({ w, h, children }: EmbedLoadingFrameProps) => {
  const { t } = useTranslation('board');
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [overlayMounted, setOverlayMounted] = useState(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onLoad = (e: Event) => {
      if (e.target instanceof HTMLIFrameElement) setLoaded(true);
    };
    el.addEventListener('load', onLoad, true);
    const timer = window.setTimeout(() => setLoaded(true), LOADER_TIMEOUT_MS);

    return () => {
      el.removeEventListener('load', onLoad, true);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const id = window.setTimeout(() => setOverlayMounted(false), LOADER_FADE_MS);
    return () => window.clearTimeout(id);
  }, [loaded]);

  return (
    <div ref={ref} style={{ position: 'relative', width: w, height: h, pointerEvents: 'none' }}>
      {children}
      {overlayMounted && (
        <div className="text-text-disabled bg-gray-0 absolute inset-0 z-5 flex items-center justify-center text-sm">
          {t('embed.loading')}
        </div>
      )}
    </div>
  );
};
