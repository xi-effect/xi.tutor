import { useCallback, useState, useMemo, useRef } from 'react';
import { startOfDay, format } from 'date-fns';

import type { ICalendarEvent } from '../ui/types';

const MOCK_EVENTS: ICalendarEvent[] = [
  {
    id: '1',
    title: 'Дмитрий',
    start: new Date('2025-04-29T17:40:00'),
    end: new Date('2025-04-29T18:40:00'),
    type: 'lesson',
  },
  {
    id: '2',
    title: 'Отдых',
    start: new Date('2025-04-30T11:00:00'),
    end: new Date('2025-04-30T13:00:00'),
    type: 'rest',
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
    type: 'lesson',
  },
  {
    id: '6',
    title: 'Николай',
    start: new Date('2025-05-02T14:00:00'),
    end: new Date('2025-05-02T16:00:00'),
    type: 'lesson',
  },
  {
    id: '7',
    title: 'Алексей',
    start: new Date('2025-05-03T09:00:00'),
    end: new Date('2025-05-03T11:00:00'),
    type: 'lesson',
  },
  {
    id: '8',
    title: 'Ольга',
    start: new Date('2025-05-04T15:00:00'),
    end: new Date('2025-05-04T17:00:00'),
    type: 'lesson',
  },
  {
    id: '9',
    title: 'Владимир',
    start: new Date('2025-05-05T10:00:00'),
    end: new Date('2025-05-05T12:00:00'),
    type: 'lesson',
  },
  {
    id: '10',
    title: 'Катерина',
    start: new Date('2025-05-05T14:00:00'),
    end: new Date('2025-05-05T16:00:00'),
    type: 'lesson',
  },
  {
    id: '11',
    title: 'Олег',
    start: new Date('2025-05-07T09:00:00'),
    end: new Date('2025-05-07T11:00:00'),
    type: 'lesson',
  },
  {
    id: '12',
    title: 'Наталья',
    start: new Date('2025-05-07T15:00:00'),
    end: new Date('2025-05-07T17:00:00'),
    type: 'lesson',
  },
  {
    id: '13',
    title: 'Александр',
    start: new Date('2025-05-07T12:00:00'),
    end: new Date('2025-05-07T13:00:00'),
    type: 'lesson',
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
    type: 'lesson',
  },
  {
    id: '16',
    title: 'Василий',
    start: new Date('2025-05-12T15:00:00'),
    end: new Date('2025-05-12T17:00:00'),
    type: 'lesson',
  },
  {
    id: '17',
    title: 'Отдых',
    start: new Date('2025-05-13'),
    end: new Date('2025-05-13'),
    type: 'rest',
  },
  {
    id: '18',
    title: 'Отдых',
    start: new Date('2025-05-06'),
    end: new Date('2025-05-06'),
    type: 'rest',
  },
  {
    id: '19',
    title: 'Отдых',
    start: new Date('2025-05-15'),
    end: new Date('2025-05-15'),
    type: 'rest',
  },
  {
    id: '20',
    title: 'Отдых',
    start: new Date('2025-05-16'),
    end: new Date('2025-05-16'),
    type: 'rest',
  },
];

type EventsMap = Map<string, ICalendarEvent>;
type DateIndex = Map<string, Set<string>>;

export const useEvents = () => {
  const eventsMapRef = useRef<EventsMap>(new Map(MOCK_EVENTS.map((event) => [event.id, event])));

  // Версия для управления к ререндером
  const [version, setVersion] = useState(0);

  // Принудительный ререндер при изменениях
  const forceUpdate = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const getEventDates = useCallback((event: ICalendarEvent): string[] => {
    const dates: string[] = [];
    const start = new Date(event.start ?? event.end);
    const end = new Date(event.end);

    const current = new Date(start);
    while (current <= end) {
      dates.push(format(startOfDay(current), 'yyyy-MM-dd'));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, []);

  // Индекс событий по датам - пересчитывается только при изменении версии
  const dateIndex = useMemo(() => {
    const index: DateIndex = new Map();

    eventsMapRef.current.forEach((event) => {
      const dates = getEventDates(event);
      dates.forEach((dateStr) => {
        if (!index.has(dateStr)) {
          index.set(dateStr, new Set());
        }
        index.get(dateStr)?.add(event.id);
      });
    });

    return index;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, getEventDates]);

  const addEvent = useCallback(
    (event: ICalendarEvent) => {
      if (eventsMapRef.current.has(event.id)) {
        console.warn(`Event with ID ${event.id} already exists. Use updateEvent instead.`);
        return false;
      }

      eventsMapRef.current.set(event.id, event);
      forceUpdate();
      console.log('eventsMapRef.current: ', eventsMapRef.current);
      return true;
    },
    [forceUpdate],
  );

  const updateEvent = useCallback(
    (eventId: string, updates: Partial<ICalendarEvent>) => {
      const existingEvent = eventsMapRef.current.get(eventId);

      if (existingEvent) {
        eventsMapRef.current.set(eventId, { ...existingEvent, ...updates });
        forceUpdate();
      }
    },
    [forceUpdate],
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      const deleted = eventsMapRef.current.delete(eventId);
      if (deleted) {
        forceUpdate();
      }
      return deleted;
    },
    [forceUpdate],
  );

  const getEventById = useCallback((eventId: string): ICalendarEvent | undefined => {
    return eventsMapRef.current.get(eventId);
  }, []);

  const getEventsForDate = useCallback(
    (date: Date): ICalendarEvent[] => {
      const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
      const eventIds = dateIndex.get(dateKey);

      if (!eventIds) return [];

      return Array.from(eventIds)
        .map((id) => eventsMapRef.current.get(id))
        .filter((event): event is ICalendarEvent => event !== undefined)
        .sort((a, b) => a.start.getTime() - b.start.getTime());
    },
    [dateIndex],
  );

  // Получить события для диапазона дат
  const getEventsForDateRange = useCallback(
    (startDate: Date, endDate: Date): ICalendarEvent[] => {
      const eventIds = new Set<string>();
      const current = new Date(startDate);

      while (current <= endDate) {
        const dateKey = format(startOfDay(current), 'yyyy-MM-dd');
        const dayEventIds = dateIndex.get(dateKey);

        if (dayEventIds) {
          dayEventIds.forEach((id) => eventIds.add(id));
        }

        current.setDate(current.getDate() + 1);
      }

      return Array.from(eventIds)
        .map((id) => eventsMapRef.current.get(id))
        .filter((event): event is ICalendarEvent => event !== undefined)
        .sort((a, b) => a.start.getTime() - b.start.getTime());
    },
    [dateIndex],
  );

  // Заменить все события (например, при загрузке с сервера)
  const setEvents = useCallback(
    (events: ICalendarEvent[]) => {
      eventsMapRef.current.clear();
      events.forEach((event) => {
        eventsMapRef.current.set(event.id, event);
      });
      forceUpdate();
    },
    [forceUpdate],
  );

  return {
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,

    getEventsForDate,
    getEventsForDateRange,

    setEvents,
  };
};
