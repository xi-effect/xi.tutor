/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Re-upload вставленных файлов. После upload в props.src пишется только file id
 * (контракт — ./storedFileSrc.ts), не getFileUrl().
 */
import type { DrContent, Editor, DrAssetId, DrShapeId } from '@ibodr/draw';
import { uploadImageRequest, uploadFileRequest } from 'common.services';
import { resolveAssetUrl, getCachedBlobUrl } from './resolveAssetUrl';
import { getRegisteredTokens } from './tokenRegistry';

/**
 * Описание одной "единицы работы" для фоновой докачки. Снимок props/meta
 * берётся ДО putContentOntoCurrentPage, чтобы избежать гонки чтения из
 * editor'а после того, как shape/asset уже в Yjs.
 */
export interface PasteUploadTask {
  kind: 'asset' | 'shape';
  /** id ассета/шейпа в editor'е после putContentOntoCurrentPage({preserveIds:true}). */
  id: string;
  props: Record<string, any>;
  meta: Record<string, any> | undefined;
  /** true — поддерживается uploadImageRequest (asset.type=image/video). */
  canBeImage: boolean;
}

/**
 * Синхронная подготовка clipboard content к вставке.
 *
 * Делает ТОЛЬКО то, что обязательно нужно до `putContentOntoCurrentPage`:
 * восстанавливает `props.src = meta.originalSrc` для same-board случая
 * (когда ассет уже есть в editor'е под тем же id и src был подменён
 * на data:URL во время copy).
 *
 * Всё остальное (скачивание blob'а из чужой доски и re-upload на текущую)
 * выносится в фон — см. {@link uploadPastedAssetsInBackground}. Это позволяет
 * shape'ам появиться на доске мгновенно: они отрисуются либо из data:URL,
 * который уже встроен в clipboard, либо через myAssetStore.resolve (тот
 * вытащит blob из in-memory cache или сходит за ним по sourceToken).
 */
export function preparePastedContent(
  content: DrContent,
  editor: Editor,
  token: string,
): PasteUploadTask[] {
  const contentAny = content as any;
  const tasks: PasteUploadTask[] = [];

  const isSameBoard = (contentAny.assets ?? []).some(
    (a: any) => !!editor.getAsset(a.id) && a.meta?.sourceToken === token,
  );

  for (const asset of contentAny.assets ?? []) {
    const existingAsset = editor.getAsset(asset.id);
    if (existingAsset && asset.meta?.sourceToken === token) {
      const originalSrc = asset.meta?.originalSrc;
      if (originalSrc) {
        (asset.props as any).src = originalSrc;
      }
      continue;
    }

    tasks.push({
      kind: 'asset',
      id: asset.id,
      props: { ...asset.props },
      meta: asset.meta,
      canBeImage: true,
    });
  }

  for (const shape of contentAny.shapes ?? []) {
    if (shape.type !== 'audio' && shape.type !== 'pdf') continue;

    if (isSameBoard && shape.meta?.originalSrc) {
      (shape.props as any).src = shape.meta.originalSrc;
      continue;
    }

    tasks.push({
      kind: 'shape',
      id: shape.id,
      props: { ...shape.props },
      meta: shape.meta,
      canBeImage: false,
    });
  }

  return tasks;
}

/**
 * Fire-and-forget фоновая докачка и re-upload пасированных ассетов.
 *
 * Использует id'ы, сохранённые `putContentOntoCurrentPage({preserveIds:true})`,
 * чтобы по готовности каждого upload'а вызвать `editor.updateAssets`/
 * `editor.updateShape`. Пользователь видит shape'ы сразу же (с preview src),
 * а серверный URL подменяется индивидуально по мере готовности.
 *
 * После завершения всех задач — {@link reconcilePasteInlineSources}: если
 * по каким-то причинам upload не удался и в документе остался `data:`/`blob:`,
 * подменяем на `meta.originalSrc` из снимка paste (обычный file-id), чтобы не
 * оставлять мегабайты base64 в Yjs и не сохранять мёртвые blob:-URL навсегда.
 * Это не «гарантия отображения» (ссылка может быть без токена), но гарантия
 * против «залипания» тяжёлого inline в CRDT.
 *
 * Абсолютная гарантия «вообще никогда не писать data: в синхронизируемое
 * хранилище» достигается только другим дизайном: временный preview вне записи
 * ассета (как у tldraw `createTemporaryAssetPreview`) до успешного upload.
 *
 * Параллельность ограничена 5 запросами, чтобы не упереться в HTTP/1.1-лимит
 * браузера (6 коннектов на хост) и не перегружать бэкенд.
 */
export function uploadPastedAssetsInBackground(
  tasks: PasteUploadTask[],
  editor: Editor,
  token: string,
): void {
  if (tasks.length === 0) return;

  const remapped = new Map<string, string>();
  /**
   * In-flight дедупликация: если два task'а указывают на один и тот же
   * исходный файл (одинаковый `meta.originalSrc`), не делаем для них два
   * параллельных fetch+POST — второй ждёт результат первого.
   */
  const inFlight = new Map<string, Promise<string | null>>();

  const runTask = async (task: PasteUploadTask): Promise<void> => {
    const newSrc = await resolveAndUploadOne(task, token, remapped, inFlight);
    if (!newSrc) return;

    if (task.kind === 'asset') {
      const existing = editor.getAsset(task.id as DrAssetId);
      if (!existing) return;
      editor.updateAssets([
        {
          ...existing,
          props: { ...existing.props, src: newSrc } as any,
        },
      ]);
    } else {
      const shape = editor.getShape(task.id as DrShapeId);
      if (!shape) return;
      editor.updateShape({
        id: task.id as DrShapeId,
        type: shape.type,
        props: { ...(shape.props as any), src: newSrc },
      });
    }
  };

  const CONCURRENCY = 5;
  let cursor = 0;
  const runners = Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, async () => {
    while (cursor < tasks.length) {
      const myIdx = cursor++;
      try {
        await runTask(tasks[myIdx]);
      } catch (err) {
        console.warn('[uploadPastedAssetsInBackground] task failed:', err);
      }
    }
  });

  void Promise.allSettled(runners).then(() => {
    reconcilePasteInlineSources(editor, tasks);
  });
}

/** Снимает с документа оставшиеся inline `src` после paste-upload (best-effort). */
function reconcilePasteInlineSources(editor: Editor, tasks: PasteUploadTask[]): void {
  for (const task of tasks) {
    const fallback = typeof task.meta?.originalSrc === 'string' ? task.meta.originalSrc : '';
    if (!fallback) continue;

    if (task.kind === 'asset') {
      const asset = editor.getAsset(task.id as DrAssetId);
      if (!asset) continue;
      const src = (asset.props as any)?.src as string | undefined;
      if (!src || !isInlineAssetSrc(src) || src === fallback) continue;
      editor.updateAssets([
        {
          ...asset,
          props: { ...asset.props, src: fallback } as any,
        },
      ]);
    } else {
      const shape = editor.getShape(task.id as DrShapeId);
      if (!shape) continue;
      const src = (shape.props as any)?.src as string | undefined;
      if (!src || !isInlineAssetSrc(src) || src === fallback) continue;
      editor.updateShape({
        id: task.id as DrShapeId,
        type: shape.type,
        props: { ...(shape.props as any), src: fallback },
      });
    }
  }
}

function isInlineAssetSrc(src: string): boolean {
  return src.startsWith('data:') || src.startsWith('blob:');
}

async function resolveAndUploadOne(
  task: PasteUploadTask,
  destToken: string,
  remapped: Map<string, string>,
  inFlight: Map<string, Promise<string | null>>,
): Promise<string | null> {
  const { props, meta } = task;
  const src: string | undefined = props.src;
  if (!src) return null;

  const dedupKey = meta?.originalSrc ?? src;

  if (remapped.has(dedupKey)) {
    return remapped.get(dedupKey)!;
  }

  const inFlightPromise = inFlight.get(dedupKey);
  if (inFlightPromise) return inFlightPromise;

  const promise = doResolveAndUpload(task, destToken, remapped);
  inFlight.set(dedupKey, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(dedupKey);
  }
}

async function doResolveAndUpload(
  task: PasteUploadTask,
  destToken: string,
  remapped: Map<string, string>,
): Promise<string | null> {
  const { props, meta, id, canBeImage } = task;
  const src: string | undefined = props.src;
  if (!src) return null;

  const dedupKey = meta?.originalSrc ?? src;

  let blob: Blob | null = null;

  // 0. In-memory blob cache (populated whenever an asset was successfully displayed
  //    in this browser session). Primary path for same-session cross-board paste
  //    via SPA navigation: the image was loaded on board A, its blob URL is still
  //    alive in memory, no token needed to access it.
  const fileRef = meta?.originalSrc ?? src;
  const cachedBlobUrl = getCachedBlobUrl(fileRef) ?? getCachedBlobUrl(src);
  if (cachedBlobUrl) {
    try {
      blob = await fetchBlob(cachedBlobUrl);
    } catch {
      blob = null;
    }
  }

  // 1. data:/blob: URLs (e.g. from clipboard prefetch) or external http sources.
  //    Our storage URLs always require `x-storage-token` header so plain fetch()
  //    against them is a guaranteed 403 — skip those.
  if (!blob) {
    const isInlineUrl = src.startsWith('data:') || src.startsWith('blob:');
    const isExternalHttp = src.startsWith('http') && !src.includes('/storage-service/');
    if (isInlineUrl || isExternalHttp) {
      try {
        blob = await fetchBlob(src);
      } catch {
        blob = null;
      }
    }
  }

  // 2. Primary fallback: use sourceToken from clipboard meta.
  if (!blob && meta?.sourceToken) {
    try {
      const blobUrl = await resolveAssetUrl(fileRef, meta.sourceToken);
      blob = await fetchBlob(blobUrl);
    } catch {
      blob = null;
    }
  }

  // 3. Secondary fallback: try tokens from the registry.
  if (!blob) {
    for (const altToken of getRegisteredTokens()) {
      if (altToken === destToken) continue;
      try {
        const blobUrl = await resolveAssetUrl(fileRef, altToken);
        blob = await fetchBlob(blobUrl);
        if (blob) break;
      } catch {
        continue;
      }
    }
  }

  if (!blob) return null;

  try {
    const rawName: string = props.fileName || props.name || `file-${id}`;
    const mimeType = await resolveMimeType(blob, rawName);
    const name = ensureFileExtension(rawName, mimeType);
    const file = new File([blob], name, { type: mimeType });

    const isImage = canBeImage && mimeType.startsWith('image/');
    const fileId = isImage
      ? await uploadImageRequest({ file, token: destToken })
      : await uploadFileRequest({ file, token: destToken });
    // Контракт персиста: только id — см. utils/storedFileSrc.ts
    const newSrc = fileId;

    remapped.set(dedupKey, newSrc);
    return newSrc;
  } catch (error) {
    console.warn(
      '[uploadPastedAssetsInBackground] re-upload failed:',
      id,
      { name: props.fileName ?? props.name, blobType: blob?.type, size: blob?.size },
      error,
    );
    return null;
  }
}

async function fetchBlob(src: string): Promise<Blob | null> {
  const response = await fetch(src);
  if (!response.ok) return null;
  return response.blob();
}

/**
 * Маппинг "проверенных" Content-Type → расширение файла.
 * Используется и для `ensureFileExtension`, и для проверки blob.type
 * на «внятность» — мы доверяем только тем mime, которые тут перечислены.
 */
const KNOWN_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/jpx': 'jpx',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/tiff': 'tiff',
  'image/bmp': 'bmp',
  'image/x-icon': 'ico',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'application/pdf': 'pdf',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jpx: 'image/jpx',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  heic: 'image/heic',
  heif: 'image/heif',
  pdf: 'application/pdf',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  mp4: 'video/mp4',
};

/**
 * Надёжно определяет MIME-тип файла перед re-upload.
 *
 * Бэкенд возвращает 415 «File content doesn't match the content-type header»,
 * если части FormData отдаётся `Content-Type: application/octet-stream` (или
 * пустой), а реальные байты — это, например, PNG. Источников «грязного»
 * mime у нас два: storage может отдавать `application/octet-stream`, а blob,
 * взятый из `data:URL`, иногда тоже теряет точный тип.
 *
 * Порядок проверки:
 *   1) `blob.type`, если он есть в списке известных типов.
 *   2) magic bytes (надёжнее всего — реальное содержимое).
 *   3) расширение из имени файла из meta.
 *   4) исходный `blob.type` или octet-stream.
 */
async function resolveMimeType(blob: Blob, fileName: string): Promise<string> {
  const declared = (blob.type || '').toLowerCase();
  if (declared && KNOWN_MIME_TO_EXT[declared]) return declared;

  const sniffed = await sniffMimeFromMagicBytes(blob);
  if (sniffed) return sniffed;

  const ext = extractExtension(fileName);
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];

  return declared || 'application/octet-stream';
}

async function sniffMimeFromMagicBytes(blob: Blob): Promise<string | null> {
  const arr = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
  if (arr.length < 4) return null;

  if (arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff) return 'image/jpeg';
  if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4e && arr[3] === 0x47) return 'image/png';
  if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38) return 'image/gif';
  if (
    arr.length >= 12 &&
    arr[0] === 0x52 &&
    arr[1] === 0x49 &&
    arr[2] === 0x46 &&
    arr[3] === 0x46 &&
    arr[8] === 0x57 &&
    arr[9] === 0x45 &&
    arr[10] === 0x42 &&
    arr[11] === 0x50
  ) {
    return 'image/webp';
  }
  if (arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46)
    return 'application/pdf';
  if (arr[0] === 0x42 && arr[1] === 0x4d) return 'image/bmp';
  if (arr.length >= 4 && arr[0] === 0x49 && arr[1] === 0x49 && arr[2] === 0x2a && arr[3] === 0x00)
    return 'image/tiff';
  if (arr.length >= 4 && arr[0] === 0x4d && arr[1] === 0x4d && arr[2] === 0x00 && arr[3] === 0x2a)
    return 'image/tiff';
  if (arr[0] === 0x00 && arr[1] === 0x00 && arr[2] === 0x01 && arr[3] === 0x00)
    return 'image/x-icon';
  if (arr[0] === 0x3c) return 'image/svg+xml';

  return null;
}

function extractExtension(name: string): string | null {
  if (!name) return null;
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return null;
  return name.slice(dot + 1).toLowerCase();
}

/**
 * Гарантирует, что имя файла имеет расширение, соответствующее mimeType.
 * Бэкенд при `multipart/form-data` нередко перепроверяет имя — без `.png`
 * (или с конфликтующим расширением) выдаёт 415.
 */
function ensureFileExtension(name: string, mimeType: string): string {
  const targetExt = KNOWN_MIME_TO_EXT[mimeType];
  if (!targetExt) return name;
  const currentExt = extractExtension(name);
  if (currentExt === targetExt || (currentExt === 'jpeg' && targetExt === 'jpg')) return name;
  const base = currentExt ? name.slice(0, name.length - currentExt.length - 1) : name;
  return `${base || 'file'}.${targetExt}`;
}
