import { FILE_KIND, type FileKind } from 'common.api';

export const PPTX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.presentationml.presentation';

const MIME_ALIASES: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/x-png': 'image/png',
  'image/vnd.microsoft.icon': 'image/x-icon',
  'application/x-pdf': 'application/pdf',
};

const IMAGE_MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jpx: 'image/jpx',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  avif: 'image/avif',
};

const AUDIO_MIME_BY_EXT: Record<string, string> = {
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  m4a: 'audio/x-m4a',
};

const IMAGE_MIMES = new Set(Object.values(IMAGE_MIME_BY_EXT));
const AUDIO_MIMES = new Set([
  ...Object.values(AUDIO_MIME_BY_EXT),
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/x-m4a',
  'audio/aac',
  'audio/x-wav',
  'audio/x-flac',
]);

export function getFileExtension(name: string): string | null {
  if (!name) return null;
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return null;
  return name.slice(dot + 1).toLowerCase();
}

function canonicalMime(type: string | undefined): string {
  const raw = (type || '').toLowerCase();
  return MIME_ALIASES[raw] ?? raw;
}

export function getContentUploadKind(file: Pick<File, 'name' | 'type'>): FileKind {
  const mime = canonicalMime(file.type);
  const ext = getFileExtension(file.name);

  if (IMAGE_MIMES.has(mime) || (ext && IMAGE_MIME_BY_EXT[ext])) {
    return FILE_KIND.Image;
  }

  if (mime === 'application/pdf' || ext === 'pdf') {
    return FILE_KIND.Document;
  }

  if (mime === PPTX_CONTENT_TYPE || ext === 'pptx') {
    return FILE_KIND.Presentation;
  }

  if (AUDIO_MIMES.has(mime) || (ext && AUDIO_MIME_BY_EXT[ext])) {
    return FILE_KIND.Audio;
  }

  return FILE_KIND.Uncategorized;
}

function mimeForKind(file: Pick<File, 'name' | 'type'>, kind: FileKind): string | null {
  const mime = canonicalMime(file.type);
  const ext = getFileExtension(file.name);

  if (kind === FILE_KIND.Image) {
    if (IMAGE_MIMES.has(mime)) return mime;
    if (ext && IMAGE_MIME_BY_EXT[ext]) return IMAGE_MIME_BY_EXT[ext];
    return null;
  }

  if (kind === FILE_KIND.Document) {
    return 'application/pdf';
  }

  if (kind === FILE_KIND.Presentation) {
    return PPTX_CONTENT_TYPE;
  }

  if (kind === FILE_KIND.Audio) {
    if (AUDIO_MIMES.has(mime)) return mime;
    if (ext && AUDIO_MIME_BY_EXT[ext]) return AUDIO_MIME_BY_EXT[ext];
    return mime || null;
  }

  return mime || null;
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpx': 'jpx',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/tiff': 'tiff',
  'image/bmp': 'bmp',
  'image/x-icon': 'ico',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
  [PPTX_CONTENT_TYPE]: 'pptx',
};

function ensureFileName(name: string, mime: string | null): string {
  if (getFileExtension(name) || !mime) return name || 'upload';
  const ext = MIME_TO_EXT[mime];
  if (!ext) return name || 'upload';
  return `${name || 'upload'}.${ext}`;
}

/**
 * Бэкенд сверяет Content-Type части FormData с magic bytes.
 * Safari/Яндекс/Android часто отдают пустой type или alias вроде image/x-png.
 */
export function prepareContentUpload(file: File): { file: File; kind: FileKind } {
  const kind = getContentUploadKind(file);
  const mime = mimeForKind(file, kind);
  const name = ensureFileName(file.name, mime);

  if (!mime || (file.type === mime && file.name === name)) {
    return { file, kind };
  }

  return {
    kind,
    file: new File([file], name, { type: mime, lastModified: file.lastModified }),
  };
}
