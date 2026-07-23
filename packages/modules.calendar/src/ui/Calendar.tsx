import { useEffect, useRef } from 'react';
import { ScheduleKanban, ScheduleMobileView } from './components';
import { CalendarHeader } from './Header';
import { useIsMobile, useScheduleViewMode } from '../hooks';
import {
  useKanbanColumns,
  COLUMN_MIN_WIDTH,
  KANBAN_SCROLL_INNER_PADDING_END_PX,
} from '../hooks/useKanbanColumns';
import type { ChangeLessonFormData } from 'features.lesson.change';
import type { ICalendarEvent } from './types';
import { useCalendarSchedule } from './CalendarScheduleContext';

const COLUMN_GAP = 28;
const FULL_WEEK_DAYS = 7;
const FULL_WEEK_MIN_WIDTH =
  FULL_WEEK_DAYS * COLUMN_MIN_WIDTH +
  (FULL_WEEK_DAYS - 1) * COLUMN_GAP +
  KANBAN_SCROLL_INNER_PADDING_END_PX;

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
  const {
    weekDays,
    weekStart,
    goToPrev,
    goToNext,
    goToWeekStart,
    goToVisibleWindowForDate,
    setVisibleCount,
  } = useCalendarSchedule();

  const { viewMode } = useScheduleViewMode();
  const isFullWeek = viewMode === 'full-week';

  const { columnWidth, visibleCount, hasMeasured } = useKanbanColumns(
    containerRef,
    weekDays.length,
  );
  const effectiveAutoCount = Math.max(1, visibleCount);

  // В режиме full-week всегда отображаем все 7 дней; сообщаем об этом контексту
  // чтобы данные загружались для полной недели.
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

  // До первого замера ResizeObserver передаём пустой массив дней, чтобы ScheduleKanban
  // не рендерил LessonCard (и не запускал useGetClassroom) до определения реального числа колонок.
  // useLayoutEffect в useKanbanColumns гарантирует, что hasMeasured=true до первого пейнта.
  const kanbanVisibleDays = isFullWeek
    ? weekDays
    : hasMeasured
      ? weekDays.slice(0, effectiveAutoCount)
      : [];

  const kanbanColumnWidth = isFullWeek ? COLUMN_MIN_WIDTH : columnWidth;

  if (isMobile) {
    return (
      <div className="flex h-[calc(100dvh-64px)] min-h-0 flex-col">
        <ScheduleMobileView
          onAddLessonClick={onAddLessonClick}
          onLessonReschedule={onLessonReschedule}
          onSaveLesson={onSaveLesson}
        />
      </div>
    );
  }

  return (
    <div className="bg-background-page flex h-full min-h-0 min-w-0 flex-1 flex-col pl-4">
      <CalendarHeader
        weekStart={weekStart}
        visibleDayCount={effectiveVisibleCount}
        onPrev={() => goToPrev(effectiveVisibleCount)}
        onNext={() => goToNext(effectiveVisibleCount)}
        onWeekSelect={(date, count) =>
          isFullWeek ? goToWeekStart(date) : goToVisibleWindowForDate(date, count)
        }
        onAddLessonClick={onAddLessonClick != null ? () => onAddLessonClick() : undefined}
        showDateTime={showDateTimeInHeader}
      />
      <div className="bg-background-surface flex min-h-0 min-w-0 flex-1 flex-col rounded-tl-2xl pl-4">
        <div
          ref={containerRef}
          className={
            isFullWeek
              ? 'flex min-h-0 flex-1 overflow-x-auto overflow-y-hidden'
              : 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
          }
        >
          {isFullWeek ? (
            <div
              style={{ minWidth: FULL_WEEK_MIN_WIDTH }}
              className="flex h-full min-h-0 flex-1 flex-col"
            >
              <ScheduleKanban
                visibleDays={kanbanVisibleDays}
                columnWidth={kanbanColumnWidth}
                onAddLessonClick={onAddLessonClick}
                onLessonReschedule={onLessonReschedule}
                onSaveLesson={onSaveLesson}
                allowHorizontalOverflow
              />
            </div>
          ) : (
            <ScheduleKanban
              visibleDays={kanbanVisibleDays}
              columnWidth={kanbanColumnWidth}
              onAddLessonClick={onAddLessonClick}
              onLessonReschedule={onLessonReschedule}
              onSaveLesson={onSaveLesson}
            />
          )}
        </div>
      </div>
    </div>
  );
};
