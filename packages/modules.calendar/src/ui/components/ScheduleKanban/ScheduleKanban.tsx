import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from '@xipkg/icons';
import { LessonCard } from './LessonCard';
import { getDateKey, useEventsByDate } from '../../../store/eventsStore';
import { useLessonInfoModal } from '../../../hooks';
import { isPastDay } from '../../../utils';
import type { ICalendarEvent } from '../../types';
import { cn } from '@xipkg/utils';
import { Button } from '@xipkg/button';

interface ScheduleKanbanProps {
  /** Видимые дни (то же, что в заголовке календаря) */
  visibleDays: Date[];
  columnWidth: number;
  /** Вызывается при клике на кнопку добавления занятия (плюс в заголовке дня). Передаётся дата колонки для предзаполнения формы. */
  onAddLessonClick?: (date: Date) => void;
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
  visibleDays,
  columnWidth,
  onAddLessonClick,
}) => {
  const { t } = useTranslation('calendar');
  const eventsByDate = useEventsByDate();
  const today = new Date();
  const { openLessonInfo, lessonInfoModal } = useLessonInfoModal();

  return (
    <div className="flex h-[calc(100vh-72px)] flex-1 flex-col overflow-hidden">
      <div className="flex w-full min-w-0 flex-1 gap-7 overflow-hidden">
        {visibleDays.map((day) => {
          const events = getEventsForDay(eventsByDate, day);
          const dateNum = day.getDate();
          const dayName = getDayNameRu(day);

          return (
            <div
              key={day.toISOString()}
              className="group/day flex min-w-0 flex-1 flex-col"
              style={{ minWidth: columnWidth }}
            >
              <div className="flex shrink-0 items-center justify-between gap-1 py-4">
                <span
                  className={cn(
                    'group-hover/day:text-brand-80 group-hover/day:bg-brand-0 text-gray-40 bg-gray-5 flex h-[32px] w-[38px] items-center justify-center rounded-[10px] text-[14px] font-semibold transition-colors duration-300',
                  )}
                >
                  {dateNum}
                </span>
                <span
                  className={cn(
                    'text-s-base text-gray-60 group-hover/day:text-gray-90 font-medium transition-colors duration-300',
                  )}
                >
                  {dayName}
                </span>
                <Button
                  variant="none"
                  className="hover:text-primary-60 hover:bg-gray-5 flex h-[32px] w-[40px] shrink-0 items-center justify-center rounded-md p-0 text-gray-50 transition-colors"
                  aria-label={t('add_event')}
                  onClick={() => onAddLessonClick?.(day)}
                >
                  <Plus className="fill-gray-40 group-hover/day:fill-brand-80 h-5 w-5 transition-colors duration-300" />
                </Button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
                {events.length === 0 ? (
                  <span className="dark:text-gray-60 text-xs text-gray-50">—</span>
                ) : (
                  events.map((event) => (
                    <LessonCard
                      key={event.id}
                      event={event}
                      isPast={isPastDay(day, today)}
                      onClick={() => openLessonInfo(event)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      {lessonInfoModal}
    </div>
  );
};
