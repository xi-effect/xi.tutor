import type { FileKind } from 'common.api';

export const LIBRARY_UPLOAD_MAX_FILES = 10;
export const LIBRARY_UPLOAD_MAX_IMAGE_BYTES = 1 * 1024 * 1024;
export const LIBRARY_UPLOAD_MAX_OTHER_BYTES = 5 * 1024 * 1024;

const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'bmp',
  'avif',
  'heic',
  'heif',
]);

const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'webm']);
const PRESENTATION_EXTENSIONS = new Set(['pptx', 'ppt']);
const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt']);

export const getBrowserFileExtension = (file: File): string => {
  const fromName = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (fromName && fromName !== file.name.toLowerCase()) {
    return fromName;
  }

  return '';
};

export const getBrowserFileKind = (file: File): FileKind => {
  const extension = getBrowserFileExtension(file);
  const mime = file.type.toLowerCase();

  if (mime.startsWith('image/') || IMAGE_EXTENSIONS.has(extension)) {
    return 'image';
  }

  if (mime.startsWith('audio/') || AUDIO_EXTENSIONS.has(extension)) {
    return 'audio';
  }

  if (PRESENTATION_EXTENSIONS.has(extension) || mime.includes('presentation')) {
    return 'presentation';
  }

  if (DOCUMENT_EXTENSIONS.has(extension) || mime === 'application/pdf') {
    return 'document';
  }

  return 'uncategorized';
};

export const getLibraryUploadMaxBytes = (kind: FileKind): number =>
  kind === 'image' ? LIBRARY_UPLOAD_MAX_IMAGE_BYTES : LIBRARY_UPLOAD_MAX_OTHER_BYTES;

export {
  getFileUploadErrorKind as getLibraryUploadErrorKind,
  type FileUploadErrorKind as LibraryUploadErrorKind,
} from 'common.services';
