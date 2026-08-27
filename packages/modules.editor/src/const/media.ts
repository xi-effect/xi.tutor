export const MAX_MEDIA_SIZE_BYTES = 5 * 1024 * 1024; // 5 MiB

export const MAX_AUDIO_BLOCKS = 20;
export const MAX_PDF_BLOCKS = 50;
export const MAX_PRESENTATION_BLOCKS = 20;

export const ALLOWED_AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/x-m4a',
]);

const PDF_MIME_TYPES = new Set(['application/pdf', 'application/x-pdf']);
const PDF_MIME = 'application/pdf';
const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

export const AUDIO_ACCEPT = [...ALLOWED_AUDIO_MIME_TYPES, '.mp3', '.ogg', '.wav', '.m4a'].join(',');
export const PDF_ACCEPT = [PDF_MIME, '.pdf'].join(',');
export const PRESENTATION_ACCEPT = [PPTX_MIME, '.pptx'].join(',');

export const MEDIA_NODE_TYPES = ['image', 'audio', 'pdf', 'presentation'] as const;

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

export function withPdfMimeType(file: File): File {
  const name = getFileExtension(file.name) === 'pdf' ? file.name : `${file.name || 'document'}.pdf`;
  if (file.type === PDF_MIME && name === file.name) return file;
  return new File([file], name, { type: PDF_MIME, lastModified: file.lastModified });
}
