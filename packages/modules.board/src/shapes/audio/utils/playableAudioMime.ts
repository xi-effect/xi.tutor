import { fileTypeFromBuffer } from 'file-type';

const SNIFF_BYTES = 4100;

const AUDIO_MIME_ALIASES: Record<string, string> = {
  'audio/x-m4a': 'audio/mp4',
  'audio/m4a': 'audio/mp4',
  'audio/x-wav': 'audio/wav',
  'audio/wave': 'audio/wav',
  'audio/x-pn-wav': 'audio/wav',
  'audio/x-mpeg': 'audio/mpeg',
  'audio/mp3': 'audio/mpeg',
};

const AUDIO_MIME_BY_EXT: Record<string, string> = {
  mp3: 'audio/mpeg',
  mpeg: 'audio/mpeg',
  mpga: 'audio/mpeg',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  mp4: 'audio/mp4',
  webm: 'audio/webm',
};

export function normalizeAudioMime(mime: string): string {
  const base = mime.split(';')[0]?.trim().toLowerCase() ?? '';
  if (!base || base === 'application/octet-stream') return '';
  return AUDIO_MIME_ALIASES[base] ?? base;
}

function mimeFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.trim().toLowerCase() ?? '';
  return AUDIO_MIME_BY_EXT[ext] ?? '';
}

/**
 * MIME, с которым iOS согласится играть blob.
 * Storage часто отдаёт application/octet-stream: десктопный Chrome файл угадывает,
 * Safari на iPhone и iPad — нет, и у ученика тишина.
 * null — текущий type уже подходит, пересобирать blob не нужно.
 */
export async function resolvePlayableAudioMime(
  blob: Blob,
  fileName: string,
): Promise<string | null> {
  const actual = (blob.type || '').split(';')[0]?.trim().toLowerCase() ?? '';
  const declared = normalizeAudioMime(blob.type || '');

  let sniffed = '';
  try {
    const head = await blob.slice(0, SNIFF_BYTES).arrayBuffer();
    const detected = await fileTypeFromBuffer(new Uint8Array(head));
    if (detected?.mime.startsWith('audio/')) sniffed = normalizeAudioMime(detected.mime);
  } catch {
    sniffed = '';
  }

  const fromName = mimeFromFileName(fileName);
  const resolved = sniffed || declared || fromName;
  if (!resolved.startsWith('audio/')) return null;
  if (actual === resolved) return null;
  return resolved;
}

/** Возвращает исходный URL или новый blob URL с честным audio/* type. */
export async function toPlayableAudioUrl(sourceUrl: string, fileName: string): Promise<string> {
  if (!sourceUrl.startsWith('blob:') && !sourceUrl.startsWith('data:')) return sourceUrl;

  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) return sourceUrl;
    const blob = await response.blob();
    const mime = await resolvePlayableAudioMime(blob, fileName);
    if (!mime) return sourceUrl;
    return URL.createObjectURL(new Blob([blob], { type: mime }));
  } catch {
    return sourceUrl;
  }
}
