import { T, TLBaseShape } from 'tldraw';

export const AUDIO_SHAPE_WIDTH = 320;
export const AUDIO_SHAPE_HEIGHT = 80;
export const AUDIO_MIN_WIDTH = 240;
/** Высота одной строки таймкода (до 3 строк описания) */
export const TIMECODE_ROW_HEIGHT = 56;

export type AudioTimecode = {
  id: string;
  time: number;
  label: string;
  visibleToAll: boolean;
};

export type AudioShapeProps = {
  src: string;
  fileName: string;
  fileSize: number;
  duration: number;
  w: number;
  h: number;
  syncPlayback: boolean;
  timecodes: AudioTimecode[];
};

export type AudioShape = TLBaseShape<'audio', AudioShapeProps>;

const timecodeValidator = T.object({
  id: T.string,
  time: T.number,
  label: T.string,
  visibleToAll: T.boolean,
});

const timecodesValidator = {
  validate(value: unknown): AudioTimecode[] {
    if (value === undefined || value === null) return [];
    return T.arrayOf(timecodeValidator).validate(value);
  },
  validateUsingKnownGoodVersion(_knownGood: AudioTimecode[], value: unknown): AudioTimecode[] {
    if (value === undefined || value === null) return [];
    return T.arrayOf(timecodeValidator).validate(value);
  },
};

export const audioShapeProps = {
  src: T.string,
  fileName: T.string,
  fileSize: T.number,
  duration: T.number,
  w: T.number,
  h: T.number,
  syncPlayback: T.boolean,
  timecodes: timecodesValidator,
};

export function computeAudioShapeHeight(timecodeCount: number): number {
  return AUDIO_SHAPE_HEIGHT + timecodeCount * TIMECODE_ROW_HEIGHT;
}
