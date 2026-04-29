import type { LessonSchedulerMetaForCancel } from 'features.lesson.cancel';

export interface ICalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type?: EventType;
  isCancelled?: boolean;
  isAllDay?: boolean;
  lessonInfo?: ILessonInfo;
  scheduler?: ISchedulerEventMeta;
}

export interface ILessonInfo {
  studentName: string;
  subject: string;
  lessonType: LessonType;
  description?: string;
  paid?: boolean;
  complete?: boolean;
  /** id пользователя (преподавателя/студента) для UserProfile */
  teacherId?: number;
  /** id кабинета, привязанного к занятию */
  classroomId?: number;
}

export interface ISchedulerEventMeta {
  eventId: number;
  /** UUID persisted-инстанса (sole / repeated_persistent); у repeated_virtual нет */
  eventInstanceId?: string;
  instanceKind: 'sole' | 'repeated_virtual' | 'repeated_persistent';
  repetitionKind?: 'daily' | 'weekly' | null;
  repetitionModeId?: string;
  instanceIndex?: number | null;
  cancelledAt?: string | null;
}

export type EventType = 'lesson' | 'rest';
export type LessonType = 'group' | 'individual';

/** Строка занятия в списке на день (расписание, виджет дня) */
export type ScheduleLessonRow = {
  id: number;
  /** id кабинета, привязанного к занятию */
  classroomId?: number;
  /** Точное время начала занятия (для расчёта окна 5 минут) */
  startAt?: Date;
  startTime: string;
  endTime: string;
  subject: string;
  /** Текстовое описание занятия (тема, план) */
  description?: string;
  studentName: string;
  studentId: number;
  /** Метаданные планировщика для отмены вхождения (есть у событий из API расписания) */
  schedulerMeta?: LessonSchedulerMetaForCancel | null;
};

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
