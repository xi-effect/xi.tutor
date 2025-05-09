import { useCallback, useState, useMemo } from 'react';
import { startOfDay } from 'date-fns';

import type { ICalendarEvent } from '../ui/types';

const MOCK_EVENTS: ICalendarEvent[] = [
  {
    id: '1',
    title: 'Дмитрий',
    start: new Date('2025-04-29T17:40:00'),
    end: new Date('2025-04-29T18:40:00'),
    type: 'task',
  },
  {
    id: '2',
    title: 'Отдых',
    start: new Date('2025-04-30T11:00:00'),
    end: new Date('2025-04-30T13:00:00'),
    type: 'vacation',
  },
  {
    id: '3',
    title: 'Анна',
    start: new Date('2025-04-28T17:40:00'),
    end: new Date('2025-04-28T18:10:00'),
    type: 'cancelled',
  },
  {
    id: '5',
    title: 'Елена',
    start: new Date('2025-05-01T10:00:00'),
    end: new Date('2025-05-01T12:00:00'),
    type: 'task',
  },
  {
    id: '6',
    title: 'Николай',
    start: new Date('2025-05-02T14:00:00'),
    end: new Date('2025-05-02T16:00:00'),
    type: 'task',
  },
  {
    id: '7',
    title: 'Алексей',
    start: new Date('2025-05-03T09:00:00'),
    end: new Date('2025-05-03T11:00:00'),
    type: 'task',
  },
  {
    id: '8',
    title: 'Ольга',
    start: new Date('2025-05-04T15:00:00'),
    end: new Date('2025-05-04T17:00:00'),
    type: 'task',
  },
  {
    id: '9',
    title: 'Владимир',
    start: new Date('2025-05-05T10:00:00'),
    end: new Date('2025-05-05T12:00:00'),
    type: 'task',
  },
  {
    id: '10',
    title: 'Катерина',
    start: new Date('2025-05-05T14:00:00'),
    end: new Date('2025-05-05T16:00:00'),
    type: 'task',
  },
  {
    id: '11',
    title: 'Олег',
    start: new Date('2025-05-07T09:00:00'),
    end: new Date('2025-05-07T11:00:00'),
    type: 'task',
  },
  {
    id: '12',
    title: 'Наталья',
    start: new Date('2025-05-07T15:00:00'),
    end: new Date('2025-05-07T17:00:00'),
    type: 'task',
  },
  {
    id: '13',
    title: 'Александр',
    start: new Date('2025-05-07T12:00:00'),
    end: new Date('2025-05-07T13:00:00'),
    type: 'task',
  },
  {
    id: '14',
    title: 'Екатерина',
    start: new Date('2025-05-10T14:00:00'),
    end: new Date('2025-05-10T16:00:00'),
    type: 'cancelled',
  },
  {
    id: '15',
    title: 'Виктория',
    start: new Date('2025-05-11T09:00:00'),
    end: new Date('2025-05-11T11:00:00'),
    type: 'task',
  },
  {
    id: '16',
    title: 'Василий',
    start: new Date('2025-05-12T15:00:00'),
    end: new Date('2025-05-12T17:00:00'),
    type: 'task',
  },
  {
    id: '17',
    title: 'Отдых',
    end: new Date('2025-05-13'),
    type: 'vacation',
  },
  {
    id: '18',
    title: 'Отдых',
    end: new Date('2025-05-06'),
    type: 'vacation',
  },
  {
    id: '19',
    title: 'Отдых',
    end: new Date('2025-05-15'),
    type: 'vacation',
  },
  {
    id: '20',
    title: 'Отдых',
    end: new Date('2025-05-16'),
    type: 'vacation',
  },
];

export const useEvents = () => {
  const mapEvents = useMemo(() => {
    const result = new Map<string, ICalendarEvent[]>();

    MOCK_EVENTS.forEach((event) => {
      const key = startOfDay(event.end).toISOString();
      if (result.has(key)) {
        result.set(key, [...result.get(key)!, event]);
      } else {
        result.set(key, [event]);
      }
    });

    return result;
  }, []);

  const [events, setEvents] = useState(mapEvents);

  const getDayEvents = useCallback(
    (day: Date) => {
      return events.get(startOfDay(day).toISOString()) || [];
    },
    [events],
  );

  const handleAddEvent = useCallback((newEvent: ICalendarEvent) => {
    setEvents((prev) => {
      const newState = prev;
      const key = startOfDay(newEvent.end).toISOString();
      if (newState.has(key)) {
        newState.set(key, [...newState.get(key)!, newEvent]);
      } else {
        newState.set(key, [newEvent]);
      }
      return newState;
    });
  }, []);

  return {
    getDayEvents,
    handleAddEvent,
  };
};
