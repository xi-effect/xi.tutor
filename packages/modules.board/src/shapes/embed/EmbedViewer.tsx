import { useState, useEffect, useCallback } from 'react';
import { useEditor } from 'tldraw';
import type { EmbedShape } from './EmbedShape';

type EmbedViewerProps = {
  shape: EmbedShape;
};

/** Нормализует URL для iframe: добавляет протокол при необходимости, проверяет допустимые схемы */
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

/** Обёртка: по умолчанию iframe не получает события (зум/камера доски работают), по двойному клику включается взаимодействие с контентом */
function EmbedWithInteraction({
  shapeId,
  interacting,
  onInteractingChange,
  children,
}: {
  shapeId: string;
  interacting: boolean;
  onInteractingChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const editor = useEditor();

  useEffect(() => {
    const unsub = editor.store.listen(() => {
      const selected = editor.getSelectedShapeIds();
      if (!selected.includes(shapeId)) {
        onInteractingChange(false);
      }
    });
    return unsub;
  }, [editor, shapeId, onInteractingChange]);

  // Реакция на двойной клик по фигуре: tldraw вызывает EmbedShapeUtil.onDoubleClick и эмитит событие
  useEffect(() => {
    const handler = (e: { shapeId: string }) => {
      if (e.shapeId === shapeId) onInteractingChange(true);
    };
    (editor as unknown as { on: (name: string, fn: (e: { shapeId: string }) => void) => void }).on(
      'embedurl:enter-interact',
      handler,
    );
    return () =>
      (
        editor as unknown as { off: (name: string, fn: (e: { shapeId: string }) => void) => void }
      ).off('embedurl:enter-interact', handler);
  }, [editor, shapeId, onInteractingChange]);

  if (interacting) {
    return <div className="h-full w-full">{children}</div>;
  }

  return (
    <div className="relative h-full w-full">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden
        style={{ touchAction: 'none' }}
      >
        {children}
      </div>
      {/* Оверлей: принимает клики (для перехвата dblclick), колёсико не блокируем — пробрасываем */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{ pointerEvents: 'auto' }}
        aria-hidden
      >
        <span className="rounded-xl bg-black/25 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
          Двойной клик для взаимодействия
        </span>
      </div>
    </div>
  );
}

export const EmbedViewer = ({ shape }: EmbedViewerProps) => {
  const { url, title, html } = shape.props;
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [interacting, setInteracting] = useState(false);

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

  const setInteractingStable = useCallback((v: boolean) => setInteracting(v), []);

  // Вставленный HTML iframe (уже санитизирован)
  if (html != null && html !== '') {
    return (
      <EmbedWithInteraction
        shapeId={shape.id}
        interacting={interacting}
        onInteractingChange={setInteractingStable}
      >
        <div
          className={`embed-iframe-container h-full w-full [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0 ${!interacting ? '[&_iframe]:pointer-events-none' : ''}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </EmbedWithInteraction>
    );
  }

  if (error || !resolvedUrl) {
    return <ErrorPlaceholder message={error || 'Укажите ссылку'} />;
  }

  return (
    <EmbedWithInteraction
      shapeId={shape.id}
      interacting={interacting}
      onInteractingChange={setInteractingStable}
    >
      <iframe
        src={resolvedUrl}
        title={title || 'Встроенное содержимое'}
        className={`h-full w-full border-0 ${!interacting ? 'pointer-events-none' : ''}`}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
        allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </EmbedWithInteraction>
  );
};
