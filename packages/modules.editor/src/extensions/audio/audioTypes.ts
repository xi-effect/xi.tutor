export type AudioTimecode = {
  id: string;
  time: number;
  label: string;
  visibleToAll: boolean;
  createdByStudent?: boolean;
};

export type AudioNodeAttrs = {
  src: string;
  fileName: string;
  fileSize: number;
  duration: number;
  syncPlayback: boolean;
  studentsCanAddTimecodes: boolean;
  timecodesVisibleByDefault: boolean;
  studentsCanControlPlayback: boolean;
  timecodes: AudioTimecode[];
};

export const DEFAULT_AUDIO_ATTRS: Pick<
  AudioNodeAttrs,
  | 'syncPlayback'
  | 'studentsCanAddTimecodes'
  | 'timecodesVisibleByDefault'
  | 'studentsCanControlPlayback'
  | 'timecodes'
> = {
  syncPlayback: false,
  studentsCanAddTimecodes: false,
  timecodesVisibleByDefault: true,
  studentsCanControlPlayback: false,
  timecodes: [],
};

export function parseTimecodes(value: unknown): AudioTimecode[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      id: String(item.id ?? ''),
      time: Number(item.time) || 0,
      label: String(item.label ?? ''),
      visibleToAll: Boolean(item.visibleToAll),
      createdByStudent: Boolean(item.createdByStudent) || undefined,
    }))
    .filter((item) => item.id);
}

export function parseBooleanAttr(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return fallback;
}
