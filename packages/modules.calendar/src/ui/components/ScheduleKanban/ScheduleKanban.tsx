import { FC, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { startOfDay } from 'date-fns';
import { Plus } from '@xipkg/icons';
import { LessonCard } from './LessonCard';
import { ScheduleEmptyState } from './ScheduleEmptyState';
import { getDateKey, useEventsByDate } from '../../../store/eventsStore';
import { useLessonInfoModal } from '../../../hooks';
import { isCurrentDay, isPastDay } from '../../../utils';
import type { ICalendarEvent } from '../../types';
import { cn } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import { KANBAN_SCROLL_INNER_PADDING_END_PX } from '../../../hooks/useKanbanColumns';
import { scheduleEmptyBlockHeight } from './scheduleEmptyLayout';

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
  const todayStart = startOfDay(today);
  const { openLessonInfo, lessonInfoModal } = useLessonInfoModal();

  const eventsPerDay = useMemo(
    () => visibleDays.map((d) => getEventsForDay(eventsByDate, d)),
    [eventsByDate, visibleDays],
  );

  /** Скролл каждой колонки — для синхронной прокрутки и --schedule-scroll-client-px */
  const columnScrollElsRef = useRef<(HTMLDivElement | null)[]>([]);

  const setColumnScrollRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      columnScrollElsRef.current[index] = el;
    },
    [],
  );

  const ignoreScrollSync = useRef(false);

  const handleColumnScroll = useCallback((index: number) => {
    return (e: React.UIEvent<HTMLDivElement>) => {
      if (ignoreScrollSync.current) return;
      const top = e.currentTarget.scrollTop;
      ignoreScrollSync.current = true;
      columnScrollElsRef.current.forEach((colEl, i) => {
        if (colEl && i !== index && Math.abs(colEl.scrollTop - top) > 0.5) {
          colEl.scrollTop = top;
        }
      });
      requestAnimationFrame(() => {
        ignoreScrollSync.current = false;
      });
    };
  }, []);

  useLayoutEffect(() => {
    const syncScrollClientHeight = () => {
      columnScrollElsRef.current.forEach((el) => {
        if (el) {
          el.style.setProperty('--schedule-scroll-client-px', `${el.clientHeight}px`);
        }
      });
    };

    syncScrollClientHeight();
    const observed = columnScrollElsRef.current.filter((el): el is HTMLDivElement => el != null);
    if (observed.length === 0) return;

    const ro = new ResizeObserver(syncScrollClientHeight);
    observed.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [visibleDays.length, columnWidth]);

  const minCol = Math.max(columnWidth, 0);

  return (
    <div className="flex h-[calc(100vh-72px)] flex-1 flex-col overflow-hidden">
      <div
        className="flex min-h-0 flex-1 flex-row gap-x-7"
        style={{ paddingRight: KANBAN_SCROLL_INNER_PADDING_END_PX }}
      >
        {visibleDays.map((day, colIndex) => {
          const dateNum = day.getDate();
          const dayName = getDayNameRu(day);
          const events = eventsPerDay[colIndex] ?? [];
          const hasEvents = events.length > 0;

          return (
            <div
              key={day.toISOString()}
              className="group flex min-h-0 min-w-0 flex-1 flex-col"
              style={{ flex: '1 1 0', minWidth: minCol }}
            >
              <div className="flex shrink-0 items-center justify-between gap-1 py-4">
                <span
                  className={cn(
                    'text-gray-40 bg-gray-5 group-hover:text-brand-80 group-hover:bg-brand-0 flex h-[32px] w-[38px] items-center justify-center rounded-[10px] text-[14px] font-semibold transition-colors duration-300',
                  )}
                >
                  {dateNum}
                </span>
                <span
                  className={cn(
                    'text-s-base text-gray-60 group-hover:text-gray-90 font-medium transition-colors duration-300',
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
                  <Plus className="fill-gray-40 group-hover:fill-brand-80 h-5 w-5 transition-colors duration-300" />
                </Button>
              </div>

              <div
                ref={setColumnScrollRef(colIndex)}
                onScroll={handleColumnScroll(colIndex)}
                className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]"
              >
                <div className="box-border flex min-h-full min-w-0 flex-1 flex-col pb-4">
                  {hasEvents ? (
                    <div className="flex min-h-0 min-w-0 flex-col gap-4 self-stretch">
                      {events.map((event) => (
                        <LessonCard
                          key={event.id}
                          event={event}
                          isPast={isPastDay(day, today)}
                          isToday={isCurrentDay(day, todayStart)}
                          onClick={() => openLessonInfo(event)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="relative flex h-full min-h-0 min-w-0 flex-col self-stretch">
                      <div
                        className="sticky top-0 z-10 w-full self-start pb-2"
                        style={{ height: scheduleEmptyBlockHeight() }}
                      >
                        <ScheduleEmptyState
                          fillColumn
                          days={[day]}
                          onScheduleClick={() => onAddLessonClick?.(day)}
                          className="h-full w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {lessonInfoModal}
    </div>
  );
};
