export interface CalendarEvent {
  id: string
  title: string
  date: string 
  time?: string
  type?: 'task' | 'vacation' | 'cancelled'
}

export interface CalendarProps {
  events: CalendarEvent[]
  date: Date
}

export type CalendarMode = 'day' | 'week' | 'month' | 'year';

export const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Event title', date: '2025-04-15', time: '17:40', type: 'task' },
  { id: '2', title: 'Event title', date: '2025-04-15', time: '17:40', type: 'vacation' },
  { id: '3', title: 'Event title', date: '2025-04-02', time: '17:40', type: 'cancelled' },
  { id: '4', title: 'Event title', date: '2025-04-11', type: 'vacation' },
];