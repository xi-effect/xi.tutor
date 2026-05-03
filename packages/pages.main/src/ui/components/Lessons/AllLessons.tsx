import { useMemo } from 'react';
import { Button } from '@xipkg/button';
import { Add } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { EmptySchedule } from 'common.ui';
import { DayLessonListMetaProvider, DayLessonRow, getScheduleLessonEndAt } from 'modules.calendar';
import type { ChangeLessonFormData, ScheduleLessonRow } from 'modules.calendar';
import { cn } from '@xipkg/utils';

const SKELETON_COUNT = 5;

type AllLessonsProps = {
  lessons: ScheduleLessonRow[];
  /**
   * Календарный день списка (для расчёта окончания, если нет `startAt`).
   * Передавайте выбранную в расписании дату.
   */
  dayDate: Date;
  /** Пока true — рисуем скелетон-строки вместо пустого состояния */
  isLoading?: boolean;
  /** Панель действий (начать, иконки препода) на каждой карточке. По умолчанию true */
  showLessonActions?: boolean;
  onReschedule?: (lesson: ScheduleLessonRow) => void;
  onSaveLesson?: (lesson: ScheduleLessonRow, data: ChangeLessonFormData) => void;
  /** Открыть модалку добавления занятия (кнопка в пустом состоянии) */
  onAddLesson?: () => void;
};

/** Первое занятие в списке, которое ещё не закончилось (текущее или ближайшее) */
function findNearestLessonIndex(lessons: ScheduleLessonRow[], now: Date, dayDate: Date): number {
  for (let i = 0; i < lessons.length; i++) {
    const end = getScheduleLessonEndAt(lessons[i], dayDate);
    if (end != null && now < end) {
      return i;
    }
  }
  return -1;
}

const scheduleEmptyActionButtonClass =
  'bg-gray-5 hover:bg-gray-10 text-xs-base h-8 rounded-lg px-4 font-medium text-gray-80';

export const AllLessons = ({
  lessons,
  dayDate,
  isLoading = false,
  showLessonActions = true,
  onReschedule,
  onSaveLesson,
  onAddLesson,
}: AllLessonsProps) => {
  const nearestIndex = useMemo(
    () => findNearestLessonIndex(lessons, new Date(), dayDate),
    [lessons, dayDate],
  );

  return (
    <DayLessonListMetaProvider>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {isLoading ? (
          <div className="flex flex-col pr-3">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'border-gray-10 relative flex min-h-[136px] shrink-0 flex-row gap-4 p-4',
                  i < SKELETON_COUNT - 1 && 'border-b',
                )}
              >
                <div className="flex shrink-0 flex-col gap-2 pt-1">
                  <div className="bg-gray-10 h-5 w-14 animate-pulse rounded" />
                  <div className="bg-gray-10 h-4 w-10 animate-pulse rounded" />
                </div>
                <div className="flex flex-1 flex-col gap-3 pt-1">
                  <div className="bg-gray-10 h-3 w-16 animate-pulse rounded" />
                  <div className="bg-gray-10 h-6 w-32 animate-pulse rounded" />
                </div>
                <div className="absolute top-2 right-2 flex flex-1 flex-col gap-2 pt-1">
                  <div className="bg-gray-10 h-8 w-8 animate-pulse rounded" />
                  <div className="bg-gray-10 h-8 w-8 animate-pulse rounded" />
                  <div className="bg-gray-10 h-8 w-8 animate-pulse rounded" />
                </div>
                <div className="bg-gray-10 absolute right-12 bottom-3 h-8 w-[280px] animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="border-gray-10 bg-gray-0 dark:border-gray-70 mr-3 mb-3 flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-5 rounded-xl border border-dashed px-4 py-8 pr-3">
            <EmptySchedule
              className="h-auto w-full max-w-[400px] shrink-0 object-contain"
              aria-hidden
            />
            <div className="flex max-w-md flex-col gap-2 text-center">
              <p className="text-m-base font-semibold text-gray-100">
                На выбранную дату нет занятий
              </p>
              <p className="text-s-base text-gray-60 dark:text-gray-50">
                {onAddLesson
                  ? 'Добавляйте, переносите и отменяйте занятия'
                  : 'Здесь отображаются занятия, которые назначил преподаватель'}
              </p>
            </div>
            {onAddLesson ? (
              <Button
                type="button"
                variant="none"
                className={scheduleEmptyActionButtonClass}
                onClick={onAddLesson}
                data-umami-event="schedule-empty-add-lesson"
                id="schedule-empty-add-lesson"
              >
                Назначить занятие
                <Add className="fill-gray-80 ml-1 size-4 shrink-0" />
              </Button>
            ) : null}
          </div>
        ) : (
          <ScrollArea className="min-h-0 w-full flex-1">
            <div className="flex flex-col pr-3">
              {lessons.map((lesson, index) => (
                <DayLessonRow
                  key={lesson.id}
                  lesson={lesson}
                  lessonDay={dayDate}
                  showActions={showLessonActions}
                  isNearestLesson={nearestIndex >= 0 && index === nearestIndex}
                  onReschedule={onReschedule}
                  onSaveLesson={onSaveLesson}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </DayLessonListMetaProvider>
  );
};
