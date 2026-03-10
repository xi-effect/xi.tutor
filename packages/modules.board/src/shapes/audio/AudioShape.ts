import { T, TLBaseShape } from 'tldraw';

export const AUDIO_SHAPE_WIDTH = 392;
export const AUDIO_SHAPE_HEIGHT = 80;
export const AUDIO_MIN_WIDTH = 392;
/** Высота одной строки таймкода (до 3 строк описания) */
export const TIMECODE_ROW_HEIGHT = 56;

export type AudioTimecode = {
  id: string;
  time: number;
  label: string;
  visibleToAll: boolean;
  /** Таймкод создан учеником — ему разрешено редактировать описание и удалять */
  createdByStudent?: boolean;
};

export type AudioShapeProps = {
  src: string;
  fileName: string;
  fileSize: number;
  duration: number;
  w: number;
  h: number;
  syncPlayback: boolean;
  /** Разрешить ученикам добавлять таймкоды (без настроек видимости, всегда видны всем) */
  studentsCanAddTimecodes: boolean;
  /** Показывать новые таймкоды репетитора сразу всем (по умолчанию true) */
  timecodesVisibleByDefault: boolean;
  timecodes: AudioTimecode[];
};

export type AudioShape = TLBaseShape<'audio', AudioShapeProps>;

const timecodeValidator = T.object({
  id: T.string,
  time: T.number,
  label: T.string,
  visibleToAll: T.boolean,
  createdByStudent: T.boolean.optional(),
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

const studentsCanAddTimecodesValidator = {
  validate(value: unknown): boolean {
    if (value === undefined || value === null) return false;
    return T.boolean.validate(value);
  },
  validateUsingKnownGoodVersion(_knownGood: boolean, value: unknown): boolean {
    if (value === undefined || value === null) return false;
    return T.boolean.validate(value);
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
  studentsCanAddTimecodes: studentsCanAddTimecodesValidator,
  timecodesVisibleByDefault: {
    validate(value: unknown): boolean {
      if (value === undefined || value === null) return true;
      return T.boolean.validate(value);
    },
    validateUsingKnownGoodVersion(_knownGood: boolean, value: unknown): boolean {
      if (value === undefined || value === null) return true;
      return T.boolean.validate(value);
    },
  },
  timecodes: timecodesValidator,
};

/** Количество таймкодов, видимых ученикам */
export function getVisibleTimecodesCount(timecodes: AudioTimecode[]): number {
  return timecodes.filter((t) => t.visibleToAll).length;
}

export function computeAudioShapeHeight(timecodeCount: number): number {
  return AUDIO_SHAPE_HEIGHT + timecodeCount * TIMECODE_ROW_HEIGHT;
}
