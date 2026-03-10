import { useState, useEffect } from 'react';
import type { EmbedShape } from './EmbedShape';

function stopEvent(e: React.SyntheticEvent) {
  e.stopPropagation();
}

function normalizeEmbedUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    let href = trimmed;
    if (!/^https?:\/\//i.test(href)) {
      href = `https://${href}`;
    }
    const url = new URL(href);
    const protocol = url.protocol.toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') return null;
    return url.href;
  } catch {
    return null;
  }
}

const ErrorPlaceholder = ({ message }: { message: string }) => (
  <div className="text-gray-40 flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-gray-30 shrink-0">
      <path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="text-xs">{message}</span>
  </div>
);

export const EmbedViewer = ({ shape }: { shape: EmbedShape }) => {
  const { url, title, html } = shape.props;
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (html != null && html !== '') {
      setResolvedUrl(null);
      setError(null);
      return;
    }
    const normalized = normalizeEmbedUrl(url);
    if (normalized) {
      setResolvedUrl(normalized);
      setError(null);
    } else {
      setResolvedUrl(null);
      setError(url ? 'Недопустимый URL' : 'Укажите ссылку');
    }
  }, [url, html]);

  if (html != null && html !== '') {
    return (
      <div
        className="embed-iframe-container h-full w-full overflow-hidden rounded-lg [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
        style={{ pointerEvents: 'all' }}
        onPointerDown={stopEvent}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (error || !resolvedUrl) {
    return <ErrorPlaceholder message={error || 'Укажите ссылку'} />;
  }

  return (
    <iframe
      src={resolvedUrl}
      title={title || 'Встроенное содержимое'}
      className="h-full w-full overflow-hidden rounded-lg border-0"
      style={{ pointerEvents: 'all' }}
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
      allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
};
