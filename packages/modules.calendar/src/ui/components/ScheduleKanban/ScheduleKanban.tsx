import { FC, useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { startOfDay } from 'date-fns';
import { Plus } from '@xipkg/icons';
import { LessonCard } from './LessonCard';
import { LessonCardSkeleton } from './LessonCardSkeleton';
import { ScheduleEmptyState } from './ScheduleEmptyState';
import { getDateKey, useEventsByDate, useEventsLoading } from '../../../store/eventsStore';
import { useLessonInfoModal } from '../../../hooks';
import { getLessonCardSkeletonCountForDay, isCurrentDay, isPastDay } from '../../../utils';
import type { ICalendarEvent } from '../../types';
import { cn } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import { scheduleEmptyBlockHeight } from './scheduleEmptyLayout';

interface ScheduleKanbanProps {
  /** Видимые дни (то же, что в заголовке календаря) */
  visibleDays: Date[];
  columnWidth: number;
  /** Вызывается при клике на кнопку добавления занятия (плюс в заголовке дня). Передаётся дата колонки для предзаполнения формы. */
  onAddLessonClick?: (date: Date) => void;
  /** «Перенести» в карточке занятия — открыть модалку переноса снаружи (например `features.lesson.move`) */
  onLessonReschedule?: (event: ICalendarEvent) => void;
  onLessonCancel?: (event: ICalendarEvent) => void;
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

type Segment = { type: 'empty'; start: number; end: number } | { type: 'lessons'; index: number };

const buildSegments = (hasEvents: boolean[]): Segment[] => {
  const n = hasEvents.length;
  const segs: Segment[] = [];
  let i = 0;
  while (i < n) {
    if (hasEvents[i]) {
      segs.push({ type: 'lessons', index: i });
      i++;
    } else {
      let j = i;
      while (j < n && !hasEvents[j]) j++;
      segs.push({ type: 'empty', start: i, end: j - 1 });
      i = j;
    }
  }
  return segs;
};

export const ScheduleKanban: FC<ScheduleKanbanProps> = ({
  visibleDays,
  columnWidth,
  onAddLessonClick,
  onLessonReschedule,
  onLessonCancel,
}) => {
  const { t } = useTranslation('calendar');
  const eventsByDate = useEventsByDate();
  const eventsLoading = useEventsLoading();
  const today = new Date();
  const todayStart = startOfDay(today);
  const { openLessonInfo, lessonInfoModal } = useLessonInfoModal({
    onReschedule: onLessonReschedule,
    onCancelLesson: onLessonCancel,
  });

  const eventsPerDay = useMemo(
    () => visibleDays.map((d) => getEventsForDay(eventsByDate, d)),
    [eventsByDate, visibleDays],
  );
  const hasEvents = useMemo(() => eventsPerDay.map((e) => e.length > 0), [eventsPerDay]);
  const segments = useMemo(() => buildSegments(hasEvents), [hasEvents]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;

    const syncScrollClientHeight = () => {
      el.style.setProperty('--schedule-scroll-client-px', `${el.clientHeight}px`);
    };

    syncScrollClientHeight();
    const ro = new ResizeObserver(syncScrollClientHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = visibleDays.length;
  const gridTemplateColumns =
    n > 0 ? `repeat(${n}, minmax(${Math.max(columnWidth, 0)}px, 1fr))` : '1fr';

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {/* Заголовки дней — без скролла */}
      <div
        className="grid shrink-0 gap-x-7 pr-3"
        style={{
          gridTemplateColumns,
        }}
      >
        {visibleDays.map((day, colIndex) => {
          const dateNum = day.getDate();
          const dayName = getDayNameRu(day);

          return (
            <div
              key={day.toISOString()}
              className="group/day flex min-w-0 flex-col"
              style={{ gridColumn: colIndex + 1 }}
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
            </div>
          );
        })}
      </div>

      {/* Один общий вертикальный скролл для всех колонок */}
      <div
        ref={scrollAreaRef}
        className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto pr-3 [scrollbar-gutter:stable]"
      >
        <div className="box-border flex min-h-full min-w-0 flex-1 flex-col">
          <div className="grid flex-1 items-stretch gap-x-7 pb-4" style={{ gridTemplateColumns }}>
            {eventsLoading
              ? visibleDays.map((day, colIndex) => {
                  const skeletonCount = getLessonCardSkeletonCountForDay(day);
                  return (
                    <div
                      key={`skeleton-${day.toISOString()}`}
                      className="flex min-h-0 min-w-0 flex-col gap-4 self-stretch"
                      style={{ gridColumn: colIndex + 1 }}
                    >
                      {Array.from({ length: skeletonCount }, (_, i) => (
                        <LessonCardSkeleton key={i} isToday={isCurrentDay(day, todayStart)} />
                      ))}
                    </div>
                  );
                })
              : segments.map((seg) => {
                  if (seg.type === 'lessons') {
                    const day = visibleDays[seg.index];
                    const events = eventsPerDay[seg.index] ?? [];
                    return (
                      <div
                        key={`lessons-${seg.index}`}
                        className="flex min-h-0 min-w-0 flex-col gap-4 self-stretch"
                        style={{ gridColumn: seg.index + 1 }}
                      >
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
                    );
                  }

                  const { start, end } = seg;
                  const firstDay = visibleDays[start];
                  const colStart = start + 1;
                  const colEnd = end + 2;

                  return (
                    <div
                      key={`empty-${start}-${end}`}
                      className="flex h-full min-h-0 min-w-0 flex-col self-stretch"
                      style={{ gridColumn: `${colStart} / ${colEnd}` }}
                    >
                      <div className="relative h-full min-h-0 w-full">
                        <div
                          className="sticky top-0 z-10 w-full self-start pb-2"
                          style={{ height: scheduleEmptyBlockHeight() }}
                        >
                          <ScheduleEmptyState
                            fillColumn
                            days={visibleDays.slice(start, end + 1)}
                            onScheduleClick={() => onAddLessonClick?.(firstDay)}
                            className="h-full w-full"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
      {lessonInfoModal}
    </div>
  );
};
