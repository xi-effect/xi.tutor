/**
 * КОНТРАКТ ХРАНЕНИЯ props.src (modules.board / Yjs)
 * =================================================
 *
 * В синхронизируемом состоянии доски (Yjs, бэкап, экспорт) поле `props.src` у
 * файловых записей — image asset, audio, pdf, file — хранит ТОЛЬКО id файла
 * из storage-service (UUID), без хоста и без `getFileUrl()`.
 *
 * Базовый URL API задаётся окружением (`VITE_SERVER_URL_BACKEND`) и подставляется
 * только в рантайме при отображении — см. `resolveAssetUrl()` → `getFileUrl(id)`.
 *
 * НЕ писать в Yjs / `editor.updateAssets` / `editor.updateShape`:
 *   - `getFileUrl(fileId)` — полный URL привязывает документ к одному окружению;
 *   - внешние http(s)-ссылки (кроме legacy-миграции ниже).
 *
 * Допустимые исключения (временные, не целевое состояние в CRDT):
 *   - `data:` / `blob:` — локальный preview до завершения upload;
 *   - пустая строка `''` — маркер «загрузка в процессе» у image asset.
 *
 * Legacy: старые комнаты могли содержать полный URL — при гидрации и перед
 * записью в Yjs вызывайте `normalizeStoredFileSrc()`.
 *
 * Валидация SDK: дефолтный ImageAssetUtil требует URL (`T.srcUrl`) — в
 * assets/boardAssetUtils.ts переопределён на `T.string` (BoardImageAssetUtil).
 */

import { extractFileIdFromUrl } from './resolveAssetUrl';

/**
 * Приводит `props.src` к формату для персиста: id файла или временный inline.
 * Legacy full URL (`.../storage-service/v2/files/{id}/`) → bare id.
 */
export function normalizeStoredFileSrc(src: string): string {
  if (!src) return src;
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;

  const legacyId = extractFileIdFromUrl(src);
  return legacyId ?? src;
}

/** Dev-предупреждение, если в персист случайно попал полный storage URL. */
export function warnIfPersistingFullStorageUrl(src: string, context: string): void {
  if (!import.meta.env.DEV) return;
  if (!src.startsWith('http://') && !src.startsWith('https://')) return;
  if (!src.includes('/storage-service/v2/files/')) return;

  console.warn(
    `[modules.board] ${context}: props.src должен быть id файла, не полный URL. ` +
      'Используйте id из uploadImageRequest/uploadFileRequest и normalizeStoredFileSrc().',
    src,
  );
}
