/**
 * Полный дамп открытой доски в zip. Из консоли на странице доски:
 *
 *   await downloadBoardArchive('пароль')
 *
 * В архиве: `board.json` (все записи store), `files.json` (соответствие src → файл)
 * и каталог `files/` с картинками и файлами.
 * Пароль сверяется с SHA-256(`${salt}:${password}`). Открытый пароль в коде не хранится.
 */
import JSZip from 'jszip';
import { saveBlob } from 'common.platform';
import { isPublicAssetSrc } from 'common.services';
import { extractFileIdFromUrl, resolveAssetUrl } from './resolveAssetUrl';
import { getBoardStorageToken } from './shapeSvgExport';
import { isInlineAssetSrc, normalizeStoredFileSrc } from './storedFileSrc';
import { getRegisteredTokens } from './tokenRegistry';

/** Соль для SHA-256(`${salt}:${password}`). */
export const BOARD_ARCHIVE_PASSWORD_SALT = '60d69db2f464bac7c6096cee6acb9b0b';

const BOARD_ARCHIVE_PASSWORD_HASH =
  '29fc4beebd810ad9bd37aa68d4fa860c8bd8556a7d71a1418f3d9720460cf0ca';

const FILE_SHAPE_TYPES = new Set(['file', 'audio', 'pdf', 'presentation']);

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/avif': 'avif',
  'image/heic': 'heic',
  'image/tiff': 'tiff',
  'application/pdf': 'pdf',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/zip': 'zip',
  'text/plain': 'txt',
};

export type BoardSnapshot = {
  records: object[];
  byId: Record<string, object>;
};

export type CollectedBoardFile = {
  src: string;
  fileName?: string;
  mimeType?: string;
};

export type BoardArchiveFileEntry = {
  src: string;
  path?: string;
  bytes?: number;
  error?: string;
};

export type BoardArchiveResult = {
  fileName: string;
  savedFiles: number;
  failed: BoardArchiveFileEntry[];
};

type SaveArchive = (blob: Blob, fileName: string) => Promise<unknown>;
type FetchBoardFile = (src: string, token: string) => Promise<Blob>;

type DownloadBoardArchiveOptions = {
  password: string;
  records: readonly object[];
  token?: string;
  save?: SaveArchive;
  fetchFile?: FetchBoardFile;
  now?: Date;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return value as Record<string, unknown>;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function sha256Hex(text: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('В этом окружении нет crypto.subtle');
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hashesMatch(actual: string, expected: string): boolean {
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let index = 0; index < actual.length; index += 1) {
    diff |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return diff === 0;
}

export async function assertBoardArchivePassword(password: string): Promise<void> {
  const digest = await sha256Hex(`${BOARD_ARCHIVE_PASSWORD_SALT}:${password ?? ''}`);
  if (!hashesMatch(digest, BOARD_ARCHIVE_PASSWORD_HASH)) {
    throw new Error('Неверный пароль');
  }
}

/** Снимок store в том же виде, что и консольный `getBoardSnapshot`. */
export function buildBoardSnapshot(records: readonly object[]): BoardSnapshot {
  const normalized = records.map((record) => {
    const raw = asRecord(record) ?? {};
    const props = asRecord(raw.props);
    if (!props || typeof props.src !== 'string') return { ...raw };
    return {
      ...raw,
      props: { ...props, src: normalizeStoredFileSrc(props.src) },
    };
  });

  return {
    records: normalized,
    byId: Object.fromEntries(
      normalized.map((record) => [String((record as { id?: unknown }).id ?? ''), record]),
    ),
  };
}

function persistedFileSrc(src: string | undefined): string | undefined {
  if (!src || isInlineAssetSrc(src)) return undefined;
  const normalized = normalizeStoredFileSrc(src);
  return normalized || undefined;
}

function addFile(
  files: Map<string, CollectedBoardFile>,
  rawSrc: unknown,
  hint?: { fileName?: unknown; mimeType?: unknown },
) {
  const inlineOrStored = readString(rawSrc);
  if (!inlineOrStored || inlineOrStored.startsWith('asset:')) return;

  const src =
    persistedFileSrc(inlineOrStored) ??
    (isInlineAssetSrc(inlineOrStored) ? inlineOrStored : undefined);
  if (!src) return;

  const existing = files.get(src);
  const fileName = readString(hint?.fileName);
  const mimeType = readString(hint?.mimeType);
  if (existing) {
    if (!existing.fileName && fileName) existing.fileName = fileName;
    if (!existing.mimeType && mimeType) existing.mimeType = mimeType;
    return;
  }

  files.set(src, { src, fileName, mimeType });
}

function walkImageSources(value: unknown, files: Map<string, CollectedBoardFile>) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item) => walkImageSources(item, files));
    return;
  }

  const record = value as Record<string, unknown>;
  if ('imageSrc' in record) addFile(files, record.imageSrc);
  for (const child of Object.values(record)) {
    if (child && typeof child === 'object') walkImageSources(child, files);
  }
}

/** Картинки asset, файлы фигур и imageSrc активностей. Стикеры-эмодзи не попадают. */
export function collectBoardFiles(records: readonly object[]): CollectedBoardFile[] {
  const files = new Map<string, CollectedBoardFile>();

  for (const record of records) {
    const rec = asRecord(record);
    if (!rec) continue;
    const props = asRecord(rec.props);
    const meta = asRecord(rec.meta);
    const hint = {
      fileName: props?.fileName ?? props?.name,
      mimeType: props?.mimeType,
    };

    if (rec.typeName === 'asset' && rec.type !== 'bookmark') {
      const stored = persistedFileSrc(readString(props?.src));
      const original = persistedFileSrc(readString(meta?.originalSrc));
      if (stored || original) {
        addFile(files, stored ?? original, hint);
      } else {
        addFile(files, props?.src, hint);
      }
    }

    if (rec.typeName === 'shape' && FILE_SHAPE_TYPES.has(String(rec.type))) {
      const stored = persistedFileSrc(readString(props?.src));
      const original = persistedFileSrc(readString(meta?.originalSrc));
      if (stored || original) {
        addFile(files, stored ?? original, hint);
      } else {
        addFile(files, props?.src, hint);
      }
    }

    if (rec.typeName === 'shape') walkImageSources(props, files);
  }

  return [...files.values()];
}

function isExternalHttp(src: string): boolean {
  return (
    (src.startsWith('http://') || src.startsWith('https://')) &&
    !src.includes('/storage-service/') &&
    !src.includes('/content-service/')
  );
}

async function blobFromUrl(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.blob();
}

export async function fetchBoardFile(src: string, token: string): Promise<Blob> {
  if (src.startsWith('data:') || src.startsWith('blob:') || isExternalHttp(src)) {
    return blobFromUrl(src);
  }

  if (isPublicAssetSrc(src)) {
    const url = await resolveAssetUrl(src, token);
    return blobFromUrl(url);
  }

  const tokens = [
    ...new Set([token, getBoardStorageToken(), ...getRegisteredTokens()].filter(Boolean)),
  ];
  let lastError: unknown;
  for (const candidate of tokens.length > 0 ? tokens : ['']) {
    try {
      const url = await resolveAssetUrl(src, candidate);
      if (!url.startsWith('blob:') && !url.startsWith('data:') && !url.startsWith('http')) {
        throw new Error('файл не скачался');
      }
      return blobFromUrl(url);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('не удалось скачать файл');
}

function sanitizeStem(value: string): string {
  const stem = value
    .split(/[/\\]/)
    .pop()
    ?.replace(/\.[a-z0-9]{1,8}$/i, '')
    .replace(/[^\w.\-()+\u0400-\u04FF ]+/g, '_')
    .trim();
  return (stem || 'file').slice(0, 80);
}

function extensionFor(file: CollectedBoardFile, blob: Blob): string {
  const fromName = file.fileName?.match(/\.([a-z0-9]{1,8})$/i)?.[1]?.toLowerCase();
  if (fromName) return fromName;
  const mime = (blob.type || file.mimeType || '').split(';')[0].trim().toLowerCase();
  return MIME_TO_EXT[mime] ?? 'bin';
}

function fileStem(file: CollectedBoardFile): string {
  if (file.src.startsWith('data:') || file.src.startsWith('blob:')) {
    return file.fileName ? sanitizeStem(file.fileName) : 'inline';
  }
  const id = extractFileIdFromUrl(file.src) ?? file.src;
  if (id.startsWith('http://') || id.startsWith('https://') || id.startsWith('/')) {
    return sanitizeStem(id);
  }
  const safeId = sanitizeStem(id);
  if (!file.fileName) return safeId;
  return `${safeId}--${sanitizeStem(file.fileName)}`;
}

function archiveFilePath(file: CollectedBoardFile, blob: Blob, used: Set<string>): string {
  const ext = extensionFor(file, blob);
  const stem = fileStem(file);
  let name = `${stem}.${ext}`;
  let index = 2;
  while (used.has(name)) {
    name = `${stem}-${index}.${ext}`;
    index += 1;
  }
  used.add(name);
  return `files/${name}`;
}

function manifestSrc(src: string): string {
  if (src.startsWith('data:') && src.length > 120) return `data:…(${src.length})`;
  return src;
}

async function mapPool<T, R>(
  items: readonly T[],
  limit: number,
  run: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await run(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

export function boardArchiveFileName(now = new Date()): string {
  return `board-archive-${now.toISOString().replace(/[:.]/g, '-')}.zip`;
}

export async function buildBoardArchive(options: {
  records: readonly object[];
  token?: string;
  fetchFile?: FetchBoardFile;
  now?: Date;
}): Promise<{ blob: Blob; fileName: string; entries: BoardArchiveFileEntry[] }> {
  const snapshot = buildBoardSnapshot(options.records);
  const files = collectBoardFiles(options.records);
  const fetchFile = options.fetchFile ?? fetchBoardFile;
  const token = options.token ?? '';
  const zip = new JSZip();
  const usedNames = new Set<string>();

  const entries = await mapPool(files, 4, async (file) => {
    try {
      const blob = await fetchFile(file.src, token);
      const path = archiveFilePath(file, blob, usedNames);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      zip.file(path, bytes, { compression: 'STORE' });
      return { src: manifestSrc(file.src), path, bytes: bytes.byteLength };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'не удалось скачать файл';
      return { src: manifestSrc(file.src), error: message };
    }
  });

  zip.file('board.json', JSON.stringify(snapshot, null, 2));
  zip.file(
    'files.json',
    JSON.stringify(
      {
        exportedAt: (options.now ?? new Date()).toISOString(),
        files: entries,
      },
      null,
      2,
    ),
  );

  const buffer = await zip.generateAsync({ type: 'arraybuffer' });
  const blob = new Blob([buffer], { type: 'application/zip' });
  return { blob, fileName: boardArchiveFileName(options.now), entries };
}

export async function downloadBoardArchive(
  options: DownloadBoardArchiveOptions,
): Promise<BoardArchiveResult> {
  await assertBoardArchivePassword(options.password);

  const fileCount = collectBoardFiles(options.records).length;
  console.info(`[board] собираю архив, вложений: ${fileCount}`);
  const archive = await buildBoardArchive(options);
  const save = options.save ?? ((blob, fileName) => saveBlob(blob, { fileName }));
  await save(archive.blob, archive.fileName);

  const failed = archive.entries.filter((entry) => entry.error);
  const savedFiles = archive.entries.length - failed.length;
  console.info(`[board] архив ${archive.fileName}: файлов ${savedFiles}, ошибок ${failed.length}`);

  return { fileName: archive.fileName, savedFiles, failed };
}
