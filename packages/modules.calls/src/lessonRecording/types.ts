export type RecordingFormat = 'webm' | 'mp4';

export type LessonRecordingFailureReason =
  | 'capture_denied'
  | 'capture_unsupported'
  | 'desktop_rejected'
  | 'recorder_error'
  | 'sink_error'
  | 'conference_unavailable'
  | 'unknown';

export type RecordingResult = {
  sizeBytes: number;
  filename: string;
  format: RecordingFormat;
  mimeType: string;
  durationSeconds: number;
};

/**
 * Куда пишутся куски записи.
 * Браузер стримит в OPFS и в конце отдаёт файл на скачивание.
 * Electron пишет в выбранный файл сразу — тот же контракт, без накопления ролика в RAM.
 */
export interface RecordingSink {
  write(chunk: Blob): Promise<void>;
  finalize(durationMs: number): Promise<{ sizeBytes: number; filename: string }>;
  abort(): Promise<void>;
}
