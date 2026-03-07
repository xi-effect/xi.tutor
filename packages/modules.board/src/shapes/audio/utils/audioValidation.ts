/**
 * Допустимые MIME-типы для аудио (whitelist).
 * Должно совпадать с AUDIO_ACCEPT в pickAndInsertAudio.
 */
export const ALLOWED_AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/aac',
  'audio/mp4',
  'audio/webm',
  'audio/flac',
  'audio/x-m4a',
]);

const HEADER_LENGTH = 16;

/** Сигнатуры форматов (magic bytes). Проверяем только начало файла. */
function matchesSignature(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 4) return false;

  // ID3 (MP3 с тегом)
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return true;

  // MPEG frame sync (MP3 без ID3): 0xFF 0xE0..0xFF (первый байт 0xFF, второй старшие биты 111)
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return true;

  // OggS
  if (bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return true;

  // RIFF....WAVE
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes.length >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x41 &&
    bytes[10] === 0x56 &&
    bytes[11] === 0x45
  )
    return true;

  // fLaC
  if (bytes[0] === 0x66 && bytes[1] === 0x4c && bytes[2] === 0x61 && bytes[3] === 0x43) return true;

  // ftyp (MP4/M4A/AAC — ISO Base Media) at offset 4
  if (
    bytes.length >= 8 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  )
    return true;

  // WebM (EBML)
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return true;

  return false;
}

/**
 * Проверяет, что содержимое файла соответствует аудио-сигнатуре (magic bytes).
 * Читает только начало файла.
 */
export async function checkAudioMagicBytes(file: File): Promise<boolean> {
  const blob = file.slice(0, HEADER_LENGTH);
  const buffer = await blob.arrayBuffer();
  return matchesSignature(buffer);
}
