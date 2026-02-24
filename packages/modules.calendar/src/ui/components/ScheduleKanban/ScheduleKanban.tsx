import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@xipkg/scrollarea';
import { LessonCard } from './LessonCard';
import { getDateKey, useEventsByDate } from '../../../store/eventsStore';
import { isPastDay } from '../../../utils';
import type { ICalendarEvent } from '../../types';

interface ScheduleKanbanProps {
  weekDays: Date[];
}

const getEventsForDay = (
  eventsByDate: Record<string, ICalendarEvent[]>,
  day: Date,
): ICalendarEvent[] => {
  const key = getDateKey(day);
  const events = eventsByDate[key] ?? [];
  return events.filter((e) => !e.isAllDay);
};

/** Короткое название месяца по-русски (например, «ноя») */
const getMonthShortRu = (date: Date): string => {
  const s = date.toLocaleDateString('ru-RU', { month: 'short' });
  return s.slice(0, 3).toUpperCase();
};

export const ScheduleKanban: FC<ScheduleKanbanProps> = ({ weekDays }) => {
  const { t } = useTranslation('calendar');
  const eventsByDate = useEventsByDate();
  const today = new Date();

  const weekDayLabels = t('week_days')
    .split(',')
    .map((s) => s.trim());

  return (
    <div className="flex min-h-0 flex-1">
      <ScrollArea className="w-full">
        <div className="flex min-w-[560px]">
          {weekDays.map((day, index) => {
            const events = getEventsForDay(eventsByDate, day);
            const dayLabel = weekDayLabels[index] ?? '';
            const dayName = dayLabel.toUpperCase();
            const dateNum = day.getDate();
            const monthShort = getMonthShortRu(day);
            const headerLabel = `${dayName}, ${dateNum} ${monthShort}`;

            return (
              <div key={day.toISOString()} className="flex min-w-0 flex-1 flex-col">
                <div className="sticky top-0 z-10 shrink-0 px-2 py-3">
                  <span className="text-gray-80 text-xs font-medium dark:text-gray-100">
                    {headerLabel}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 px-2 pb-4">
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
      </ScrollArea>
    </div>
  );
};
