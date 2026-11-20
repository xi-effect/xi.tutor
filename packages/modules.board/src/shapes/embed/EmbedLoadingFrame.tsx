import { useEffect, useMemo, useState } from 'react';
import { track, useEditor } from '@ibodr/draw';
import { useTranslation } from 'react-i18next';
import { EMBED_IFRAME_SANDBOX, LOADER_FADE_MS, LOADER_TIMEOUT_MS } from './consts';
import { resolveEmbedUrl } from './embedProviders';

type EmbedFrameProps = { url: string; w: number; h: number };

export const EmbedLoadingFrame = track(({ url, w, h }: EmbedFrameProps) => {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const [loaded, setLoaded] = useState(false);
  const [overlayMounted, setOverlayMounted] = useState(true);

  const result = useMemo(() => resolveEmbedUrl(url), [url]);
  const embed = result.ok ? result.embed : null;
  const src = embed?.src;

  useEffect(() => {
    setLoaded(false);
    setOverlayMounted(true);
    if (!src) return;
    const timer = window.setTimeout(() => setLoaded(true), LOADER_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [src]);

  useEffect(() => {
    if (!loaded) return;
    const id = window.setTimeout(() => setOverlayMounted(false), LOADER_FADE_MS);
    return () => window.clearTimeout(id);
  }, [loaded]);

  const isReadonly = editor.getInstanceState().isReadonly;
  const live = isReadonly || (editor.getCurrentToolId() === 'select' && editor.isIn('select.idle'));

  if (!embed) {
    return (
      <div className="border-border-default bg-gray-0 text-text-disabled flex h-full w-full items-center justify-center rounded-xl border p-4 text-center text-sm shadow-md">
        {t('embed.blocked')}
      </div>
    );
  }

  return (
    <div
      className="border-border-default bg-gray-0 flex flex-col overflow-hidden rounded-xl border shadow-md"
      style={{ width: w, height: h }}
    >
      <div
        className="border-border-default bg-background-surface flex shrink-0 rounded-t-xl border px-2 py-1.5 shadow-md"
        style={{ pointerEvents: 'none' }}
      >
        <span className="text-text-primary truncate text-sm">{embed.label}</span>
      </div>

      <div className="relative min-h-0 flex-1 p-1">
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          <iframe
            key={embed.src}
            src={embed.src}
            title={embed.label}
            className="h-full w-full border-0"
            sandbox={EMBED_IFRAME_SANDBOX}
            allow={embed.allow}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setLoaded(true)}
            style={{ pointerEvents: live ? 'auto' : 'none' }}
          />
          {overlayMounted && (
            <div
              role="status"
              aria-hidden={loaded}
              className="text-text-disabled bg-gray-0 absolute inset-0 z-5 flex items-center justify-center text-sm transition-opacity"
              style={{
                pointerEvents: 'none',
                opacity: loaded ? 0 : 1,
                transitionDuration: `${LOADER_FADE_MS}ms`,
              }}
            >
              {t('embed.loading')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
