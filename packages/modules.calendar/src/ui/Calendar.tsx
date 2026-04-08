import { useRef } from 'react';
import { ScheduleKanban, ScheduleMobileView } from './components';
import { CalendarHeader } from './Header';
import { useCalendar, useIsMobile } from '../hooks';
import { useKanbanColumns } from '../hooks/useKanbanColumns';

type CalendarModuleProps = {
  /** Вызывается при клике на кнопку добавления занятия (в хедере или в колонке канбана). Дата колонки передаётся при клике в канбане. */
  onAddLessonClick?: (date?: Date) => void;
};

export const CalendarModule = ({ onAddLessonClick }: CalendarModuleProps) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const { weekDays, weekStart, goToPrev, goToNext, goToWeekStart } = useCalendar();
  const { columnWidth, visibleCount } = useKanbanColumns(containerRef, weekDays.length);
  const visibleDays = weekDays.slice(0, visibleCount);

  if (isMobile) {
    return <ScheduleMobileView onAddLessonClick={onAddLessonClick} />;
  }

  return (
    <div className="bg-gray-5 flex min-h-screen flex-1 flex-col pl-4">
      <CalendarHeader
        weekStart={weekStart}
        visibleDays={visibleDays}
        onPrev={() => goToPrev(visibleCount)}
        onNext={() => goToNext(visibleCount)}
        onWeekSelect={goToWeekStart}
        onAddLessonClick={() => onAddLessonClick?.()}
      />
      <div className="bg-gray-0 rounded-tl-2xl pl-4">
        <div ref={containerRef} className="flex min-h-0 flex-1 overflow-hidden">
          <ScheduleKanban
            visibleDays={visibleDays}
            columnWidth={columnWidth}
            onAddLessonClick={onAddLessonClick}
          />
        </div>
      </div>
    </div>
  );
};
