import { getRegisteredTokens } from './tokenRegistry';
import { resolveAssetAsDataUrl } from './resolveAssetUrl';

/** Плотность PNG-экспорта (bitmap pixels на CSS-пиксель SVG). */
export const PNG_EXPORT_PIXEL_RATIO = 3;

/** Итоговый множитель растеризации вложенных картинок/PDF при toSvg. */
export function getSvgExportRasterScale(ctx: {
  scale?: number;
  pixelRatio?: number | null;
}): number {
  const scale = ctx.scale ?? 1;
  const pixelRatio = ctx.pixelRatio ?? PNG_EXPORT_PIXEL_RATIO;
  return Math.max(1, scale * pixelRatio);
}

/** Токен текущей / недавно открытой доски для резолва ассетов вне React. */
export function getBoardStorageToken(): string {
  return getRegisteredTokens()[0] ?? '';
}

export async function blobOrUrlToDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Конвертирует URL (blob / http / file id) в data:URL для встраивания в SVG-экспорт.
 * File id резолвится через storage token.
 */
export async function resolveSrcForSvgExport(
  src: string,
  token = getBoardStorageToken(),
): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith('data:')) return src;

  if (src.startsWith('blob:') || src.startsWith('http://') || src.startsWith('https://')) {
    const fromFetch = await blobOrUrlToDataUrl(src);
    if (fromFetch) return fromFetch;
    return urlToDataUrlViaImage(src);
  }

  if (token) {
    const viaStorage = await resolveAssetAsDataUrl(src, token);
    if (viaStorage) return viaStorage;
  }

  return urlToDataUrlViaImage(src);
}

/** Fallback через <img> + canvas (когда fetch/CORS мешают). */
export function urlToDataUrlViaImage(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx || canvas.width === 0 || canvas.height === 0) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function truncateForSvg(text: string, maxChars: number): string {
  if (!text) return '';
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 1))}…`;
}

/** Нейтральная палитра карточек в SVG (CSS-переменные доски в экспорте недоступны). */
export const SVG_CARD = {
  bg: '#ffffff',
  border: '#e4e4e7',
  text: '#18181b',
  muted: '#71717a',
  accent: '#3b82f6',
  icon: '#52525b',
} as const;
