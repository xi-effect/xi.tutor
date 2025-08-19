import { useMemo } from 'react';
import { addDays, format, startOfDay } from 'date-fns';
import { create } from 'zustand';

import { MOCK_EVENTS } from '../mocks';

import type { ICalendarEvent } from '../ui/types';

export const getDateKey = (date: Date): string => {
  return format(startOfDay(date), 'yyyy-MM-dd');
};

const getEventDateKeys = (event: ICalendarEvent): string[] => {
  const keys: string[] = [];
  const start = new Date(event.start ?? event.end);
  const end = new Date(event.end);

  let current = startOfDay(start);
  const endDay = startOfDay(end);

  while (current <= endDay) {
    keys.push(getDateKey(current));
    current = addDays(current, 1);
  }

  return keys;
};

interface EventsStore {
  events: ICalendarEvent[];

  getEventById: (eventId: string) => ICalendarEvent | undefined;
  getEventsByDate: (date: Date) => ICalendarEvent[];

  addEvent: (event: ICalendarEvent) => void;
  updateEvent: (eventId: string, updates: Partial<ICalendarEvent>) => void;
  deleteEvent: (eventId: string) => void;
}

const useEventsStore = create<EventsStore>((set, get) => ({
  events: MOCK_EVENTS,

  getEventById: (eventId) => get().events.find((event) => event.id === eventId),

  getEventsByDate: (date) => {
    const dateKey = getDateKey(date);
    return get()
      .events.filter((event) => {
        const eventDateKeys = getEventDateKeys(event);
        return eventDateKeys.includes(dateKey);
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  },

  addEvent: (event) => {
    const state = get();
    if (state.events.some((e) => e.id === event.id)) return;

    set({ events: [...state.events, event] });
  },

  updateEvent: (eventId, updates) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event,
      ),
    }));
  },

  deleteEvent: (eventId) => {
    const state = get();
    const eventExists = state.events.some((e) => e.id === eventId);
    if (!eventExists) return;

    set({ events: state.events.filter((event) => event.id !== eventId) });
  },
}));

// Селекторы
export const useEventsByDate = (): Record<string, ICalendarEvent[]> => {
  const allEvents = useEventsStore((state) => state.events);

  return useMemo(() => {
    const grouped: Record<string, ICalendarEvent[]> = {};

    allEvents.forEach((event) => {
      const eventDateKeys = getEventDateKeys(event);
      eventDateKeys.forEach((dateKey) => {
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(event);
      });
    });

    // Сортируем события в каждой группе
    Object.keys(grouped).forEach((dateKey) => {
      grouped[dateKey].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    });

    return grouped;
  }, [allEvents]);
};

export const useEventById = () => {
  return useEventsStore((state) => state.getEventById);
};

export const useAddEvent = () => {
  return useEventsStore((state) => state.addEvent);
};

export const useUpdateEvent = () => {
  return useEventsStore((state) => state.updateEvent);
};

export const useDeleteEvent = () => {
  return useEventsStore((state) => state.deleteEvent);
};
