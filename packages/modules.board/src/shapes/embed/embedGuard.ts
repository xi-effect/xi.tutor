import type { Editor } from '@ibodr/draw';
import { resolveEmbedUrl } from 'modules.embed';

function sanitizeEmbedShape<T extends { type: string; props: object }>(shape: T): T {
  if (shape.type !== 'embed') return shape;

  const raw = (shape.props as { url?: unknown }).url;
  const url = typeof raw === 'string' ? raw : '';
  const result = resolveEmbedUrl(url);
  const safeUrl = result.ok ? result.embed.src : '';

  if (safeUrl === url) return shape;
  return { ...shape, props: { ...shape.props, url: safeUrl } };
}

export function registerEmbedGuard(editor: Editor) {
  const offCreate = editor.sideEffects.registerBeforeCreateHandler('shape', (shape) =>
    sanitizeEmbedShape(shape),
  );
  const offChange = editor.sideEffects.registerBeforeChangeHandler('shape', (_prev, next) =>
    sanitizeEmbedShape(next),
  );

  return () => {
    offCreate();
    offChange();
  };
}
