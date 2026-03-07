import { fileTypeFromBuffer } from 'file-type';

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

/** Минимальный размер буфера для надёжного определения типа (file-type рекомендует ~4100 байт). */
const DETECT_BUFFER_LENGTH = 4100;

/**
 * Проверяет тип файла по сигнатуре (magic bytes) через библиотеку file-type.
 * Читает только начало файла. Возвращает true, если содержимое распознано
 * как один из разрешённых аудио-форматов.
 */
export async function checkAudioMagicBytes(file: File): Promise<boolean> {
  const blob = file.slice(0, DETECT_BUFFER_LENGTH);
  const buffer = await blob.arrayBuffer();
  const detected = await fileTypeFromBuffer(buffer);
  return !!detected && ALLOWED_AUDIO_MIME_TYPES.has(detected.mime);
}
