export function formatRecordingClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(rest)}`;
  return `${pad(minutes)}:${pad(rest)}`;
}

/** `Sovlium lesson 02.10.2026 16-30.webm` */
export function formatLessonRecordingFilename(date: Date, extension: string): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `Sovlium lesson ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}-${pad(date.getMinutes())}.${extension}`;
}
