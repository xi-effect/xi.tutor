import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from '@xipkg/icons';
import { LessonCard } from './LessonCard';
import { getDateKey, useEventsByDate } from '../../../store/eventsStore';
import { isPastDay } from '../../../utils';
import type { ICalendarEvent } from '../../types';

interface ScheduleKanbanProps {
  weekDays: Date[];
  columnWidth: number;
  visibleCount: number;
}

const getEventsForDay = (
  eventsByDate: Record<string, ICalendarEvent[]>,
  day: Date,
): ICalendarEvent[] => {
  const key = getDateKey(day);
  const events = eventsByDate[key] ?? [];
  return events.filter((e) => !e.isAllDay);
};

/** Полное название дня недели с заглавной (например, «Понедельник») */
const getDayNameRu = (date: Date): string => {
  const name = date.toLocaleDateString('ru-RU', { weekday: 'long' });
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export const ScheduleKanban: FC<ScheduleKanbanProps> = ({
  weekDays,
  columnWidth,
  visibleCount,
}) => {
  const { t } = useTranslation('calendar');
  const eventsByDate = useEventsByDate();
  const today = new Date();
  const visibleDays = weekDays.slice(0, visibleCount);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-7">
      <div className="flex flex-1 gap-0 overflow-hidden" style={{ width: '100%' }}>
        {visibleDays.map((day) => {
          const events = getEventsForDay(eventsByDate, day);
          const dateNum = day.getDate();
          const dayName = getDayNameRu(day);
          const isToday =
            day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear();

          return (
            <div
              key={day.toISOString()}
              className="border-gray-20 dark:border-gray-70 flex shrink-0 flex-col border-r last:border-r-0"
              style={{
                minWidth: columnWidth,
                maxWidth: columnWidth,
                width: columnWidth,
              }}
            >
              <div className="flex shrink-0 items-center justify-between gap-1 px-2 py-3">
                <span
                  className={
                    isToday
                      ? 'text-primary-60 font-semibold'
                      : 'text-gray-80 font-medium dark:text-gray-100'
                  }
                  style={{ fontSize: '13px' }}
                >
                  {dateNum} {dayName}
                </span>
                <button
                  type="button"
                  className="hover:text-primary-60 hover:bg-primary-5 dark:text-gray-60 dark:hover:bg-primary-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-50 transition-colors"
                  aria-label={t('add_event')}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-4">
                {events.length === 0 ? (
                  <span className="dark:text-gray-60 text-xs text-gray-50">—</span>
                ) : (
                  events.map((event) => (
                    <LessonCard key={event.id} event={event} isPast={isPastDay(day, today)} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
