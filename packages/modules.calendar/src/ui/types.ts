export interface ICalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type?: EventType;
  isCancelled?: boolean;
  isAllDay?: boolean;
  lessonInfo?: ILessonInfo;
}

export interface ILessonInfo {
  studentName: string;
  subject: string;
  lessonType: LessonType;
  description?: string;
  paid?: boolean;
  complete?: boolean;
}

export type EventType = 'lesson' | 'rest';
export type LessonType = 'group' | 'individual';

export type CalendarMode = 'day' | 'week' | 'month' | 'year';
export type WeekOrDayMode = Extract<CalendarMode, 'week' | 'day'>;

export type CalendarDays<T extends CalendarMode> = T extends 'year' ? Date[][] : Date[];

export interface CalendarProps<T extends CalendarMode> {
  days: CalendarDays<T>;
}

export type ModeVariant = {
  label: string;
  value: CalendarMode;
};

const MODES = ['day', 'week', 'month', 'year'];

export function isCalendarMode(mode: string): mode is CalendarMode {
  return MODES.includes(mode);
}

export function isWeekOrDayMode(mode: CalendarMode): mode is WeekOrDayMode {
  return ['week', 'day'].includes(mode);
}
