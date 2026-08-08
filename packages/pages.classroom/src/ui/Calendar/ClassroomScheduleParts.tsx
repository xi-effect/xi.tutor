import { useEffect, useRef } from 'react';
import {
  CalendarWeekNav,
  COLUMN_MIN_WIDTH,
  KANBAN_SCROLL_INNER_PADDING_END_PX,
  SCHEDULE_VIEW_MODE_STORAGE_KEY,
  ScheduleKanban,
  useKanbanColumns,
  useScheduleViewMode,
} from 'modules.calendar';
import type { ChangeLessonFormData, ICalendarEvent } from 'modules.calendar';
import { useClassroomSchedule } from './ClassroomScheduleContext';

const COLUMN_GAP = 28;
const FULL_WEEK_DAYS = 7;
const FULL_WEEK_MIN_WIDTH =
  FULL_WEEK_DAYS * COLUMN_MIN_WIDTH +
  (FULL_WEEK_DAYS - 1) * COLUMN_GAP +
  KANBAN_SCROLL_INNER_PADDING_END_PX;

export const CalendarScheduleToolbar = () => {
  const {
    visibleDayCount,
    weekStart,
    goToPrev,
    goToNext,
    goToWeekStart,
    goToVisibleWindowForDate,
  } = useClassroomSchedule();

  // Читаем напрямую — toolbar ренедерится при смене visibleDayCount через контекст
  const isFullWeek =
    typeof window !== 'undefined' &&
    localStorage.getItem(SCHEDULE_VIEW_MODE_STORAGE_KEY) === 'full-week';

  return (
    <CalendarWeekNav
      weekStart={weekStart}
      visibleDayCount={visibleDayCount}
      onPrev={() => goToPrev(visibleDayCount)}
      onNext={() => goToNext(visibleDayCount)}
      onWeekSelect={(date, count) =>
        isFullWeek ? goToWeekStart(date) : goToVisibleWindowForDate(date, count)
      }
    />
  );
};

type CalendarScheduleKanbanProps = {
  onLessonReschedule?: (event: ICalendarEvent) => void;
  onSaveLesson?: (event: ICalendarEvent, data: ChangeLessonFormData) => void;
  openLessonInstanceId?: string | null;
  onOpenLessonInstanceConsumed?: () => void;
};

export const CalendarScheduleKanban = ({
  onLessonReschedule,
  onSaveLesson,
  openLessonInstanceId,
  onOpenLessonInstanceConsumed,
}: CalendarScheduleKanbanProps) => {
  const { weekDays, weekStart, onAddLessonClick, setVisibleCount, goToWeekStart } =
    useClassroomSchedule();

  const { viewMode } = useScheduleViewMode();
  const isFullWeek = viewMode === 'full-week';

  const containerRef = useRef<HTMLDivElement>(null);
  const { columnWidth, visibleCount } = useKanbanColumns(containerRef, weekDays.length);
  const effectiveAutoCount = Math.max(1, visibleCount);

  const effectiveVisibleCount = isFullWeek ? FULL_WEEK_DAYS : effectiveAutoCount;

  // В режиме full-week weekStart всегда должен быть понедельником.
  // getDay() === 1 — понедельник, goToWeekStart вызовет startOfWeek(..., { weekStartsOn: 1 }).
  useEffect(() => {
    if (!isFullWeek || weekStart.getDay() === 1) return;
    goToWeekStart(weekStart);
  }, [isFullWeek, weekStart, goToWeekStart]);

  useEffect(() => {
    setVisibleCount(effectiveVisibleCount);
  }, [effectiveVisibleCount, setVisibleCount]);

  const visibleDays = isFullWeek ? weekDays : weekDays.slice(0, effectiveAutoCount);
  const kanbanColumnWidth = isFullWeek ? COLUMN_MIN_WIDTH : columnWidth;

  return (
    <div
      ref={containerRef}
      className={
        isFullWeek
          ? 'flex h-full min-h-0 flex-1 overflow-x-auto overflow-y-hidden'
          : 'flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden'
      }
    >
      {isFullWeek ? (
        <div
          style={{ minWidth: FULL_WEEK_MIN_WIDTH }}
          className="flex h-full min-h-0 flex-1 flex-col"
        >
          <ScheduleKanban
            visibleDays={visibleDays}
            columnWidth={kanbanColumnWidth}
            onAddLessonClick={onAddLessonClick ? (date: Date) => onAddLessonClick(date) : undefined}
            onLessonReschedule={onLessonReschedule}
            onSaveLesson={onSaveLesson}
            hideLessonCardClassroomAndSubject
            openLessonInstanceId={openLessonInstanceId ?? null}
            onOpenLessonInstanceConsumed={onOpenLessonInstanceConsumed}
            allowHorizontalOverflow
          />
        </div>
      ) : (
        <ScheduleKanban
          visibleDays={visibleDays}
          columnWidth={kanbanColumnWidth}
          onAddLessonClick={onAddLessonClick ? (date: Date) => onAddLessonClick(date) : undefined}
          onLessonReschedule={onLessonReschedule}
          onSaveLesson={onSaveLesson}
          hideLessonCardClassroomAndSubject
          openLessonInstanceId={openLessonInstanceId ?? null}
          onOpenLessonInstanceConsumed={onOpenLessonInstanceConsumed}
        />
      )}
    </div>
  );
};
