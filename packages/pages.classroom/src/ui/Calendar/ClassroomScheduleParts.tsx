import { useRef } from 'react';
import { CalendarWeekNav, ScheduleKanban, useKanbanColumns } from 'modules.calendar';
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

export const CalendarScheduleKanban = () => {
  const { weekDays, onAddLessonClick } = useClassroomSchedule();

  const containerRef = useRef<HTMLDivElement>(null);
  const { columnWidth, visibleCount } = useKanbanColumns(containerRef, weekDays.length);
  const visibleDays = weekDays.slice(0, visibleCount);

  return (
    <div
      ref={containerRef}
      // 88px — шапка кабинета, 8px — pt-2 на Tabs.Root, 56px — таб-бар
      className="h-[calc(100vh-160px)] w-full min-w-0 flex-col overflow-hidden"
    >
      <ScheduleKanban
        visibleDays={visibleDays}
        columnWidth={columnWidth}
        onAddLessonClick={onAddLessonClick ? (date: Date) => onAddLessonClick(date) : undefined}
      />
    </div>
  );
};
