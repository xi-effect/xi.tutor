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
