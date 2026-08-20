// Форматы, которые принимает бэкенд POST .../file-kinds/image/files/ (конвертирует в webp сам)
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

/**
 * Допустимые MIME-типы для аудио (whitelist).
 * Должно совпадать с AUDIO_ACCEPT в pickAndInsertAudio.
 * Бэкенд: POST .../file-kinds/audio/files/
 */
export const ALLOWED_AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/x-m4a',
]);

/**
 * Допустимые MIME-типы для файлов (whitelist).
 * Должно совпадать с FILE_ACCEPT в pickAndInsertFile.
 */
export const ALLOWED_FILE_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // (.xlsx)
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // (.pptx)
  'text/plain',
  'text/csv',
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  // OpenDocument форматы (альтернативные форматы для офисных документов, поддерживаемые LibreOffice / OpenOffice)
  'application/vnd.oasis.opendocument.presentation', // .odp
  'application/vnd.oasis.opendocument.spreadsheet', // .ods
  'application/vnd.oasis.opendocument.text', // .odt
]);

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  ...ALLOWED_FILE_MIME_TYPES,
  ...ALLOWED_AUDIO_MIME_TYPES,
];

/**
 * Расширения для input.accept. На Android/Huawei MIME-only accept часто
 * открывает Галерею и скрывает PDF/документы — расширения это чинят.
 */
export const FILE_INPUT_EXTENSIONS = [
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

export const FILE_INPUT_ACCEPT = [...FILE_INPUT_EXTENSIONS, ...ALL_ALLOWED_TYPES].join(',');

const PDF_MIME_TYPES = new Set(['application/pdf', 'application/x-pdf']);

export function isPdfMime(type: string | undefined): boolean {
  return PDF_MIME_TYPES.has((type || '').toLowerCase());
}

export function getFileExtension(name: string): string | null {
  if (!name) return null;
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return null;
  return name.slice(dot + 1).toLowerCase();
}

/** Android/Huawei/Harmony: MIME-фильтр пикера часто сводит выбор к Галерее. */
export function getBoardFileInputAccept(): string {
  if (typeof navigator === 'undefined') return FILE_INPUT_ACCEPT;
  if (/Android|HarmonyOS|Huawei|HUAWEI/i.test(navigator.userAgent)) return '*/*';
  return FILE_INPUT_ACCEPT;
}
