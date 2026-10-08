import type { RecordingFormat } from './types';

export type RecordingMimeChoice = {
  mimeType: string;
  format: RecordingFormat;
  extension: 'webm' | 'mp4';
};

const CANDIDATES: RecordingMimeChoice[] = [
  { mimeType: 'video/webm;codecs=vp9,opus', format: 'webm', extension: 'webm' },
  { mimeType: 'video/webm;codecs=vp8,opus', format: 'webm', extension: 'webm' },
  { mimeType: 'video/webm;codecs=vp9', format: 'webm', extension: 'webm' },
  { mimeType: 'video/webm', format: 'webm', extension: 'webm' },
  { mimeType: 'video/mp4', format: 'mp4', extension: 'mp4' },
];

export function selectRecordingMimeType(
  isSupported: (mimeType: string) => boolean = defaultIsSupported,
): RecordingMimeChoice {
  for (const candidate of CANDIDATES) {
    if (isSupported(candidate.mimeType)) return candidate;
  }
  return { mimeType: '', format: 'webm', extension: 'webm' };
}

function defaultIsSupported(mimeType: string): boolean {
  return typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mimeType);
}
