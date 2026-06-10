import { useEffect, useRef } from 'react';
import { CalendarWeekNav, ScheduleKanban, useKanbanColumns } from 'modules.calendar';
import type { ChangeLessonFormData, ICalendarEvent } from 'modules.calendar';
import { useClassroomSchedule } from './ClassroomScheduleContext';

export const CalendarScheduleToolbar = () => {
  const { visibleDayCount, weekStart, goToPrev, goToNext, goToVisibleWindowForDate } =
    useClassroomSchedule();
  return (
    <CalendarWeekNav
      weekStart={weekStart}
      visibleDayCount={visibleDayCount}
      onPrev={() => goToPrev(visibleDayCount)}
      onNext={() => goToNext(visibleDayCount)}
      onWeekSelect={goToVisibleWindowForDate}
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
  const { weekDays, onAddLessonClick, setVisibleCount } = useClassroomSchedule();

  const containerRef = useRef<HTMLDivElement>(null);
  const { columnWidth, visibleCount } = useKanbanColumns(containerRef, weekDays.length);
  const visibleDays = weekDays.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(visibleCount);
  }, [visibleCount, setVisibleCount]);

  return (
    <div ref={containerRef} className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <ScheduleKanban
        visibleDays={visibleDays}
        columnWidth={columnWidth}
        onAddLessonClick={onAddLessonClick ? (date: Date) => onAddLessonClick(date) : undefined}
        onLessonReschedule={onLessonReschedule}
        onSaveLesson={onSaveLesson}
        hideLessonCardClassroomAndSubject
        openLessonInstanceId={openLessonInstanceId ?? null}
        onOpenLessonInstanceConsumed={onOpenLessonInstanceConsumed}
      />
    </div>
  );
};
