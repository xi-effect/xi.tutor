import { collectDroppedFiles } from 'common.services';

const BINARY_PASTE_MIME = /^(image|video|audio|application)\//;

export type PasteClipboardSnapshot = {
  html: string;
  text: string;
  files: File[];
};

/** Скриншоты, PDF и прочие бинарники. Пустые/текстовые clipboard-items не считаем файлами. */
export function isBinaryClipboardFile(file: File): boolean {
  if (file.size <= 0) return false;
  if (file.type.startsWith('text/')) return false;
  if (BINARY_PASTE_MIME.test(file.type)) return true;
  return /\.(png|jpe?g|gif|webp|pdf|mp3|wav|ogg|mp4|webm|svg|docx?|xlsx?|pptx?)$/i.test(file.name);
}

export function looksLikeMarkup(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

/**
 * Читает clipboard синхронно из PasteEvent.
 * После любого await `event.clipboardData` в Chrome становится недоступен —
 * text/plain из адресной строки или блокнота иначе теряется.
 */
export function readPasteClipboardSnapshot(
  data: DataTransfer | null | undefined,
): PasteClipboardSnapshot {
  const html = data?.getData('text/html') || '';
  const text = data?.getData('text/plain') || data?.getData('text/uri-list') || '';
  const files = collectDroppedFiles(data).filter(isBinaryClipboardFile);
  return { html, text, files };
}
