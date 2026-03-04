import { useRef } from 'react';
import { ScheduleKanban } from './components';
import { CalendarHeader } from './Header';
import { useCalendar } from '../hooks';
import { useKanbanColumns } from '../hooks/useKanbanColumns';

type CalendarModuleProps = {
  /** Вызывается при клике на кнопку добавления занятия в канбане */
  onAddLessonClick?: () => void;
};

export const CalendarModule = ({ onAddLessonClick }: CalendarModuleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { weekDays, goToPrev, goToNext } = useCalendar();
  const { columnWidth, visibleCount } = useKanbanColumns(containerRef, weekDays.length);
  const visibleDays = weekDays.slice(0, visibleCount);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CalendarHeader
        visibleDays={visibleDays}
        onPrev={() => goToPrev(visibleCount)}
        onNext={() => goToNext(visibleCount)}
      />
      <div ref={containerRef} className="flex min-h-0 flex-1 overflow-hidden">
        <ScheduleKanban
          visibleDays={visibleDays}
          columnWidth={columnWidth}
          onAddLessonClick={onAddLessonClick}
        />
      </div>
    </div>
  );
};
