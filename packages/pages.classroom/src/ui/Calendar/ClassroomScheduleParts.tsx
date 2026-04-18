import { CalendarWeekNav, ScheduleKanban } from 'modules.calendar';
import { useClassroomSchedule } from './ClassroomScheduleContext';

export const CalendarScheduleToolbar = () => {
  const { weekStart, visibleDays, goToPrev, goToNext, goToWeekStart } = useClassroomSchedule();
  return (
    <CalendarWeekNav
      weekStart={weekStart}
      visibleDays={visibleDays}
      onPrev={goToPrev}
      onNext={goToNext}
      onWeekSelect={goToWeekStart}
    />
  );
};

export const CalendarScheduleKanban = () => {
  const { containerRef, visibleDays, columnWidth, onAddLessonClick } = useClassroomSchedule();

  return (
    <div className="bg-gray-0 rounded-tl-2xl pl-4">
      <div ref={containerRef} className="flex min-h-0 flex-1 overflow-hidden">
        <ScheduleKanban
          visibleDays={visibleDays}
          columnWidth={columnWidth}
          onAddLessonClick={onAddLessonClick ? (date: Date) => onAddLessonClick(date) : undefined}
        />
      </div>
    </div>
  );
};
