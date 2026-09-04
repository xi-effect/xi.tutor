export const MAX_MEDIA_SIZE_BYTES = 5 * 1024 * 1024; // 5 MiB

export const MAX_AUDIO_BLOCKS = 20;
export const MAX_PDF_BLOCKS = 50;
export const MAX_PRESENTATION_BLOCKS = 20;
export const MAX_FILE_BLOCKS = 20;

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpx',
  'image/png',
  'image/gif',
  'image/webp',
  'image/tiff',
  'image/bmp',
  'image/x-icon',
  'image/avif',
]);

export const ALLOWED_AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/x-m4a',
  'audio/mp4',
]);

export const ALLOWED_FILE_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.text',
]);

const PDF_MIME_TYPES = new Set(['application/pdf', 'application/x-pdf']);
const PDF_MIME = 'application/pdf';
const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

export const AUDIO_ACCEPT = [...ALLOWED_AUDIO_MIME_TYPES, '.mp3', '.ogg', '.wav', '.m4a'].join(',');
export const PDF_ACCEPT = [PDF_MIME, '.pdf'].join(',');
export const PRESENTATION_ACCEPT = [PPTX_MIME, '.pptx'].join(',');
export const IMAGE_ACCEPT = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.tif',
  '.tiff',
  '.ico',
  '.avif',
].join(',');

const FILE_INPUT_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.tif',
  '.tiff',
  '.ico',
  '.avif',
  '.mp3',
  '.ogg',
  '.wav',
  '.m4a',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.csv',
  '.mp4',
  '.webm',
  '.mov',
  '.avi',
  '.odp',
  '.ods',
  '.odt',
];

const IMAGE_INPUT_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.tif',
  '.tiff',
  '.ico',
  '.avif',
];

const ATTACHMENT_INPUT_EXTENSIONS = FILE_INPUT_EXTENSIONS.filter(
  (ext) => !IMAGE_INPUT_EXTENSIONS.includes(ext),
);

export const EDITOR_ATTACHMENT_INPUT_ACCEPT = [
  ...ATTACHMENT_INPUT_EXTENSIONS,
  ...ALLOWED_AUDIO_MIME_TYPES,
  ...ALLOWED_FILE_MIME_TYPES,
].join(',');

export const EDITOR_FILE_INPUT_ACCEPT = [IMAGE_ACCEPT, EDITOR_ATTACHMENT_INPUT_ACCEPT].join(',');

export type EditorMediaType = 'image' | 'audio' | 'pdf' | 'presentation' | 'file';

const EXT_TO_MEDIA_TYPE: Record<string, EditorMediaType> = {
  pdf: 'pdf',
  pptx: 'presentation',
  jpg: 'image',
  jpeg: 'image',
  jpx: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  tiff: 'image',
  tif: 'image',
  bmp: 'image',
  ico: 'image',
  avif: 'image',
  mp3: 'audio',
  ogg: 'audio',
  wav: 'audio',
  m4a: 'audio',
  doc: 'file',
  docx: 'file',
  xls: 'file',
  xlsx: 'file',
  ppt: 'file',
  txt: 'file',
  csv: 'file',
  mp4: 'file',
  webm: 'file',
  mov: 'file',
  avi: 'file',
  odp: 'file',
  ods: 'file',
  odt: 'file',
};

export function checkEditorMediaType(file: File): EditorMediaType | null {
  if (ALLOWED_IMAGE_MIME_TYPES.has(file.type) || file.type.startsWith('image/')) return 'image';
  if (ALLOWED_AUDIO_MIME_TYPES.has(file.type)) return 'audio';
  if (isPdfMime(file.type) || getFileExtension(file.name) === 'pdf') return 'pdf';
  if (isPresentationFile(file)) return 'presentation';
  if (ALLOWED_FILE_MIME_TYPES.has(file.type)) return 'file';

  const ext = getFileExtension(file.name);
  if (ext && EXT_TO_MEDIA_TYPE[ext]) return EXT_TO_MEDIA_TYPE[ext];

  return null;
}

export function getEditorFileInputAccept(): string {
  if (typeof navigator === 'undefined') return EDITOR_FILE_INPUT_ACCEPT;
  if (/Android|HarmonyOS|Huawei|HUAWEI/i.test(navigator.userAgent)) return '*/*';
  return EDITOR_FILE_INPUT_ACCEPT;
}

export function getEditorImageInputAccept(): string {
  if (typeof navigator === 'undefined') return IMAGE_ACCEPT;
  if (/Android|HarmonyOS|Huawei|HUAWEI/i.test(navigator.userAgent)) return 'image/*';
  return IMAGE_ACCEPT;
}

export function getEditorAttachmentInputAccept(): string {
  if (typeof navigator === 'undefined') return EDITOR_ATTACHMENT_INPUT_ACCEPT;
  if (/Android|HarmonyOS|Huawei|HUAWEI/i.test(navigator.userAgent)) return '*/*';
  return EDITOR_ATTACHMENT_INPUT_ACCEPT;
}

export const MEDIA_NODE_TYPES = ['image', 'audio', 'pdf', 'presentation', 'file'] as const;

export function getFileExtension(name: string): string | null {
  if (!name) return null;
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return null;
  return name.slice(dot + 1).toLowerCase();
}

export function isPdfMime(type: string | undefined): boolean {
  return PDF_MIME_TYPES.has((type || '').toLowerCase());
}

export function isPdfFile(file: File): boolean {
  return isPdfMime(file.type) || getFileExtension(file.name) === 'pdf';
}

export function isPresentationFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.pptx') || file.type === PPTX_MIME;
}

export function isGenericFile(file: File): boolean {
  return checkEditorMediaType(file) === 'file';
}

export function withPdfMimeType(file: File): File {
  const name = getFileExtension(file.name) === 'pdf' ? file.name : `${file.name || 'document'}.pdf`;
  if (file.type === PDF_MIME && name === file.name) return file;
  return new File([file], name, { type: PDF_MIME, lastModified: file.lastModified });
}
