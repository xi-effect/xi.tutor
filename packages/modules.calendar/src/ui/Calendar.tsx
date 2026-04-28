import { useRef } from 'react';
import { ScheduleKanban, ScheduleMobileView } from './components';
import { CalendarHeader } from './Header';
import { useCalendar, useIsMobile } from '../hooks';
import { useKanbanColumns } from '../hooks/useKanbanColumns';
import type { ICalendarEvent } from './types';

type CalendarModuleProps = {
  /** Вызывается при клике на кнопку добавления занятия (в хедере или в колонке канбана). Дата колонки передаётся при клике в канбане. */
  onAddLessonClick?: (date?: Date) => void;
  /** «Перенести» в карточке — передать в модалку переноса на уровне приложения */
  onLessonReschedule?: (event: ICalendarEvent) => void;
  onLessonCancel?: (event: ICalendarEvent) => void;
  /** Показывать дату и время в начале шапки (как на отдельной странице календаря) */
  showDateTimeInHeader?: boolean;
};

export const CalendarModule = ({
  onAddLessonClick,
  onLessonReschedule,
  onLessonCancel,
  showDateTimeInHeader = true,
}: CalendarModuleProps) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const { weekDays, weekStart, goToPrev, goToNext, goToWeekStart } = useCalendar();
  const { columnWidth, visibleCount } = useKanbanColumns(containerRef, weekDays.length);
  const visibleDays = weekDays.slice(0, visibleCount);

  if (isMobile) {
    return (
      <ScheduleMobileView
        onAddLessonClick={onAddLessonClick}
        onLessonReschedule={onLessonReschedule}
        onLessonCancel={onLessonCancel}
      />
    );
  }

  return (
    <div className="bg-gray-5 flex h-full min-h-0 min-w-0 flex-1 flex-col pl-4">
      <CalendarHeader
        weekStart={weekStart}
        visibleDays={visibleDays}
        onPrev={() => goToPrev(visibleCount)}
        onNext={() => goToNext(visibleCount)}
        onWeekSelect={goToWeekStart}
        onAddLessonClick={() => onAddLessonClick?.()}
        showDateTime={showDateTimeInHeader}
      />
      <div className="bg-gray-0 flex min-h-0 min-w-0 flex-1 flex-col rounded-tl-2xl pl-4">
        <div ref={containerRef} className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <ScheduleKanban
            visibleDays={visibleDays}
            columnWidth={columnWidth}
            onAddLessonClick={onAddLessonClick}
            onLessonReschedule={onLessonReschedule}
            onLessonCancel={onLessonCancel}
          />
        </div>
      </div>
    </div>
  );
};
