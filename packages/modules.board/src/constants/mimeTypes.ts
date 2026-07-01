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
