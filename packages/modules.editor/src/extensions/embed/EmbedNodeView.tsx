import { useEffect, useMemo, useState } from 'react';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import {
  EMBED_IFRAME_REFERRER_POLICY,
  EMBED_IFRAME_SANDBOX,
  EMBED_LOADER_FADE_MS,
  EMBED_LOADER_TIMEOUT_MS,
  resolveEmbedUrl,
} from 'modules.embed';
import { useTranslation } from 'react-i18next';
import { cn } from '@xipkg/utils';
import { useYjsContext } from '../../hooks/useYjsContext';

export const EmbedNodeView = ({ node, selected }: NodeViewProps) => {
  const { t } = useTranslation('editor');
  const { isReadOnly } = useYjsContext();
  const src = node.attrs.src;
  const result = useMemo(() => (typeof src === 'string' ? resolveEmbedUrl(src) : null), [src]);
  const [loaded, setLoaded] = useState(false);
  const [overlayMounted, setOverlayMounted] = useState(true);
  const safeSrc = result?.ok ? result.embed.src : null;

  useEffect(() => {
    setLoaded(false);
    setOverlayMounted(true);
    if (!safeSrc) return;

    const timer = window.setTimeout(() => setLoaded(true), EMBED_LOADER_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [safeSrc]);

  useEffect(() => {
    if (!loaded) return;
    const id = window.setTimeout(() => setOverlayMounted(false), EMBED_LOADER_FADE_MS);
    return () => window.clearTimeout(id);
  }, [loaded]);

  if (!result?.ok) {
    return (
      <NodeViewWrapper
        className={cn(
          'border-border-default bg-gray-0 text-text-disabled my-3 flex min-h-64 w-full items-center justify-center rounded-xl border p-4 text-center text-sm shadow-md',
          selected && 'ring-2 ring-blue-500',
        )}
        contentEditable={false}
      >
        {t('embed.blocked')}
      </NodeViewWrapper>
    );
  }

  const { embed } = result;
  const live = isReadOnly || selected;

  return (
    <NodeViewWrapper
      className={cn('my-3 w-full', selected && 'rounded-xl ring-2 ring-blue-500')}
      contentEditable={false}
    >
      <div className="border-border-default bg-gray-0 flex w-full flex-col overflow-hidden rounded-xl border shadow-md">
        <div
          className="border-border-default bg-background-surface flex shrink-0 rounded-t-xl border px-2 py-1.5 shadow-md"
          style={{ pointerEvents: 'none' }}
        >
          <span className="text-text-primary truncate text-sm">{embed.label}</span>
        </div>

        <div className="relative w-full p-1">
          <div
            className="relative w-full overflow-hidden rounded-lg"
            style={{ aspectRatio: `${embed.w} / ${embed.h}` }}
          >
            <iframe
              key={embed.src}
              src={embed.src}
              title={embed.label}
              className="absolute inset-0 h-full w-full border-0"
              sandbox={EMBED_IFRAME_SANDBOX}
              allow={embed.allow}
              allowFullScreen
              loading="lazy"
              referrerPolicy={EMBED_IFRAME_REFERRER_POLICY}
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
                  transitionDuration: `${EMBED_LOADER_FADE_MS}ms`,
                }}
              >
                {t('embed.loading')}
              </div>
            )}
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};
