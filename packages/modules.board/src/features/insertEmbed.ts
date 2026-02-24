import { nanoid } from 'nanoid';
import { Editor, TLShapeId } from 'tldraw';
import { toast } from 'sonner';
import type { EmbedShape } from '../shapes/embed';
import { sanitizeIframeHtml } from './sanitizeIframeHtml';

const DEFAULT_EMBED_WIDTH = 640;
const DEFAULT_EMBED_HEIGHT = 360;
const MAX_EMBED_SHAPES = 30;

function normalizeUrl(input: string): string | null {
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

/** Проверяет, похоже ли ввод на HTML (код iframe). */
function looksLikeHtml(input: string): boolean {
  return /<\s*iframe\s/i.test(input.trim());
}

/**
 * Вставляет на доску объект embed: по URL или по вставленному HTML iframe.
 * Принимает ссылку (https://...) или код вида <iframe src="..." ...></iframe>.
 * Размещает в центре текущего viewport.
 */
export function insertEmbed(editor: Editor, urlOrHtml: string, title: string = ''): boolean {
  const trimmed = urlOrHtml.trim();
  if (!trimmed) {
    toast.error('Пустой ввод', {
      description: 'Вставьте ссылку или HTML-код iframe (например, из YouTube).',
      duration: 5000,
    });
    return false;
  }

  const existingEmbedCount = editor
    .getCurrentPageShapes()
    .filter((s) => s.type === 'embedUrl').length;

  if (existingEmbedCount >= MAX_EMBED_SHAPES) {
    toast.error('Лимит встроенных объектов', {
      description: `На доске может быть не более ${MAX_EMBED_SHAPES} встроенных ссылок.`,
      duration: 5000,
    });
    return false;
  }

  let url: string;
  let html = '';

  if (looksLikeHtml(trimmed)) {
    const parsed = sanitizeIframeHtml(trimmed);
    if (!parsed) {
      toast.error('Недопустимый HTML', {
        description: 'Вставьте корректный код iframe с допустимым src (https://...).',
        duration: 5000,
      });
      return false;
    }
    html = parsed.html;
    url = parsed.src;
  } else {
    const normalized = normalizeUrl(trimmed);
    if (!normalized) {
      toast.error('Недопустимая ссылка', {
        description: 'Введите корректный URL или HTML-код iframe (например, из YouTube).',
        duration: 5000,
      });
      return false;
    }
    url = normalized;
  }

  const shapeId = `shape:${nanoid()}` as TLShapeId;
  const viewportCenter = editor.getViewportPageBounds().center;

  editor.createShapes<EmbedShape>([
    {
      id: shapeId,
      type: 'embedUrl',
      x: viewportCenter.x - DEFAULT_EMBED_WIDTH / 2,
      y: viewportCenter.y - DEFAULT_EMBED_HEIGHT / 2,
      props: {
        url,
        title: title || (url ? new URL(url).hostname : ''),
        html,
        w: DEFAULT_EMBED_WIDTH,
        h: DEFAULT_EMBED_HEIGHT,
      },
    },
  ]);

  return true;
}
