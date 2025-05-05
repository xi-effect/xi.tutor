export interface ICalendarEvent {
  id: string
  title: string
  start?: Date
  end: Date
  type?: 'task' | 'vacation' | 'cancelled'
}

export type CalendarMode = 'day' | 'week' | 'month' | 'year';

export type CalendarDays<T extends CalendarMode> = 
  T extends 'year' ? Date[][] : Date[];

export interface CalendarProps<T extends CalendarMode> {
  days: CalendarDays<T>
}
  

export type WeekOrDayMode = Extract<CalendarMode, 'week'|'day'>;
type ModeVariant = {
  label: string
  value: CalendarMode
}

export const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
export const MODE_VARIANTS: ModeVariant[] = [
  {
    label: 'День',
    value: 'day'
  },
  {
    label: 'Неделя',
    value: 'week'
  },
  {
    label: 'Месяц',
    value: 'month'
  },
  {
    label: 'Год',
    value: 'year'
  }
];

