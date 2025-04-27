export interface CalendarEvent {
  id: string
  title: string
  start?: Date
  end: Date
  type?: 'task' | 'vacation' | 'cancelled'
}

export interface CalendarProps {
  events: CalendarEvent[]
  date: Date
}

export type CalendarMode = 'day' | 'week' | 'month' | 'year';
export type WeekOrDayMode = Extract<CalendarMode, 'week'|'day'>;

export const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export const MOCK_EVENTS: CalendarEvent[] = [
  { 
    id: '1', 
    title: 'Event title', 
    start: new Date('2025-04-21T17:40:00'), 
    end: new Date('2025-04-21T18:40:00'),  
    type: 'task' 
  },
  { 
    id: '2', 
    title: 'Event title', 
    start: new Date('2025-04-21T11:00:00'), 
    end: new Date('2025-04-21T13:00:00'), 
    type: 'vacation' 
  },
  { 
    id: '3', 
    title: 'Event title', 
    start: new Date('2025-04-24T17:40:00'), 
    end: new Date('2025-04-24T18:10:00'), 
    type: 'cancelled' 
  },
  { 
    id: '4', 
    title: 'Event title', 
    end: new Date('2025-04-26'), 
    type: 'vacation' 
  },
];