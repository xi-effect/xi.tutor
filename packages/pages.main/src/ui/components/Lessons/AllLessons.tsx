import { useMemo } from 'react';
import { Button } from '@xipkg/button';
import { Add } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { EmptySchedule } from 'common.ui';
import { DayLessonListMetaProvider, DayLessonRow, getScheduleLessonEndAt } from 'modules.calendar';
import type { ChangeLessonFormData, ScheduleLessonRow } from 'modules.calendar';

type AllLessonsProps = {
  lessons: ScheduleLessonRow[];
  /**
   * Календарный день списка (для расчёта окончания, если нет `startAt`).
   * Передавайте выбранную в расписании дату.
   */
  dayDate: Date;
  /** Панель действий (начать, иконки препода) на каждой карточке. По умолчанию true */
  showLessonActions?: boolean;
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
  showLessonActions = true,
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
        {lessons.length === 0 ? (
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
                Добавляйте, переносите и отменяйте занятия
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
