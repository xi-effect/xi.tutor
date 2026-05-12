import { useEffect, useRef } from 'react';
import { ScheduleKanban, ScheduleMobileView } from './components';
import { CalendarHeader } from './Header';
import { useIsMobile } from '../hooks';
import { useKanbanColumns } from '../hooks/useKanbanColumns';
import type { ChangeLessonFormData } from 'features.lesson.change';
import type { ICalendarEvent } from './types';
import { useCalendarSchedule } from './CalendarScheduleContext';

type CalendarModuleProps = {
  /** Вызывается при клике на кнопку добавления занятия (в хедере или в колонке канбана). Дата колонки передаётся при клике в канбане. */
  onAddLessonClick?: (date?: Date) => void;
  /** «Перенести» в карточке — передать в модалку переноса на уровне приложения */
  onLessonReschedule?: (event: ICalendarEvent) => void;
  onSaveLesson?: (event: ICalendarEvent, data: ChangeLessonFormData) => void;
  /** Показывать дату и время в начале шапки (как на отдельной странице календаря) */
  showDateTimeInHeader?: boolean;
};

export const CalendarModule = ({
  onAddLessonClick,
  onLessonReschedule,
  onSaveLesson,
  showDateTimeInHeader = true,
}: CalendarModuleProps) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const { weekDays, weekStart, goToPrev, goToNext, goToWeekStart, setVisibleCount } =
    useCalendarSchedule();
  const { columnWidth, visibleCount, hasMeasured } = useKanbanColumns(
    containerRef,
    weekDays.length,
  );
  // До первого замера ResizeObserver передаём пустой массив дней, чтобы ScheduleKanban
  // не рендерил LessonCard (и не запускал useGetClassroom) до определения реального числа колонок.
  // useLayoutEffect в useKanbanColumns гарантирует, что hasMeasured=true до первого пейнта.
  const visibleDays = hasMeasured ? weekDays.slice(0, visibleCount) : [];

  useEffect(() => {
    setVisibleCount(visibleCount);
  }, [visibleCount, setVisibleCount]);

  if (isMobile) {
    return (
      <ScheduleMobileView
        onAddLessonClick={onAddLessonClick}
        onLessonReschedule={onLessonReschedule}
        onSaveLesson={onSaveLesson}
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
        onAddLessonClick={onAddLessonClick != null ? () => onAddLessonClick() : undefined}
        showDateTime={showDateTimeInHeader}
      />
      <div className="bg-gray-0 flex min-h-0 min-w-0 flex-1 flex-col rounded-tl-2xl pl-4">
        <div ref={containerRef} className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <ScheduleKanban
            visibleDays={visibleDays}
            columnWidth={columnWidth}
            onAddLessonClick={onAddLessonClick}
            onLessonReschedule={onLessonReschedule}
            onSaveLesson={onSaveLesson}
          />
        </div>
      </div>
    </div>
  );
};
