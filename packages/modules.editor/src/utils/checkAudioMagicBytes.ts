import { fileTypeFromBuffer } from 'file-type';
import { ALLOWED_AUDIO_MIME_TYPES } from '../const/media';

const DETECT_BUFFER_LENGTH = 4100;

export async function checkAudioMagicBytes(file: File): Promise<boolean> {
  const blob = file.slice(0, DETECT_BUFFER_LENGTH);
  const buffer = await blob.arrayBuffer();
  const detected = await fileTypeFromBuffer(buffer);
  return !!detected && ALLOWED_AUDIO_MIME_TYPES.has(detected.mime);
}
