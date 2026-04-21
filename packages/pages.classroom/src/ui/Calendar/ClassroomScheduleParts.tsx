import { useRef } from 'react';
import { CalendarWeekNav, ScheduleKanban, useKanbanColumns } from 'modules.calendar';
import type { ICalendarEvent } from 'modules.calendar';
import { useClassroomSchedule } from './ClassroomScheduleContext';

export const CalendarScheduleToolbar = () => {
  const { weekDays, weekStart, goToPrev, goToNext, goToWeekStart } = useClassroomSchedule();
  return (
    <CalendarWeekNav
      weekStart={weekStart}
      visibleDays={weekDays}
      onPrev={() => goToPrev(weekDays.length)}
      onNext={() => goToNext(weekDays.length)}
      onWeekSelect={goToWeekStart}
    />
  );
};

type CalendarScheduleKanbanProps = {
  onLessonReschedule?: (event: ICalendarEvent) => void;
};

export const CalendarScheduleKanban = ({ onLessonReschedule }: CalendarScheduleKanbanProps) => {
  const { weekDays, onAddLessonClick } = useClassroomSchedule();

  const containerRef = useRef<HTMLDivElement>(null);
  const { columnWidth, visibleCount } = useKanbanColumns(containerRef, weekDays.length);
  const visibleDays = weekDays.slice(0, visibleCount);

  return (
    <div ref={containerRef} className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <ScheduleKanban
        visibleDays={visibleDays}
        columnWidth={columnWidth}
        onAddLessonClick={onAddLessonClick ? (date: Date) => onAddLessonClick(date) : undefined}
        onLessonReschedule={onLessonReschedule}
      />
    </div>
  );
};
