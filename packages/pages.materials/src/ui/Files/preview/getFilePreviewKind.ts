import type { LibraryFile } from 'common.api';

export type FilePreviewKind = 'image' | 'audio' | 'pdf' | 'presentation' | 'unsupported';

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

export const getNormalizedExtension = (file: LibraryFile): string =>
  file.extension.replace(/^\./, '').toLowerCase();

export const getExtensionLabel = (file: LibraryFile): string => {
  const extension = getNormalizedExtension(file);
  return extension ? extension.toUpperCase() : file.kind.toUpperCase();
};

export const getFilePreviewKind = (file: LibraryFile): FilePreviewKind => {
  const extension = getNormalizedExtension(file);

  if (IMAGE_EXTENSIONS.has(extension) || file.kind === 'image') {
    return 'image';
  }

  if (AUDIO_EXTENSIONS.has(extension) || file.kind === 'audio') {
    return 'audio';
  }

  if (extension === 'pdf') {
    return 'pdf';
  }

  if (PRESENTATION_EXTENSIONS.has(extension) || file.kind === 'presentation') {
    return 'presentation';
  }

  return 'unsupported';
};

export const canPreviewFullscreen = (kind: FilePreviewKind): boolean =>
  kind === 'image' || kind === 'audio' || kind === 'pdf' || kind === 'presentation';
