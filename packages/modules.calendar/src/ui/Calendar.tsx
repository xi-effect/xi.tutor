import { useRef } from 'react';
import { ScheduleKanban } from './components';
import { CalendarHeader } from './Header';
import { useCalendar } from '../hooks';
import { useKanbanColumns } from '../hooks/useKanbanColumns';

export const CalendarModule = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { weekDays } = useCalendar();
  const { columnWidth, visibleCount } = useKanbanColumns(containerRef, weekDays.length);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CalendarHeader visibleCount={visibleCount} />
      <div ref={containerRef} className="flex min-h-0 flex-1 overflow-hidden">
        <ScheduleKanban weekDays={weekDays} columnWidth={columnWidth} visibleCount={visibleCount} />
      </div>
    </div>
  );
};
