import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { Add } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { EmptySchedule } from 'common.ui';
import { DayLessonListMetaProvider, DayLessonRow, findNearestLessonIndex } from 'modules.calendar';
import type { ChangeLessonFormData, ScheduleLessonRow } from 'modules.calendar';
import { cn } from '@xipkg/utils';
import { galleryShadowPadClass } from '../galleryShadowClass';

const SKELETON_COUNT = 4;

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
  /** Скелетон колонки иконок переноса/редактирования — только для репетитора */
  showTutorActions?: boolean;
  onReschedule?: (lesson: ScheduleLessonRow) => void;
  onSaveLesson?: (lesson: ScheduleLessonRow, data: ChangeLessonFormData) => void;
  /** Открыть модалку добавления занятия (кнопка в пустом состоянии) */
  onAddLesson?: () => void;
};

const scheduleEmptyActionButtonClass =
  'bg-background-page hover:bg-background-subtle text-xs-base h-8 rounded-lg px-4 font-medium text-text-primary';

const LessonCardSkeleton = ({ showTutorActions = true }: { showTutorActions?: boolean }) => (
  <div className="bg-background-surface relative flex min-h-[136px] shrink-0 flex-row gap-4 rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
    <div className="flex shrink-0 flex-col gap-2">
      <div className="bg-background-subtle h-7 w-14 animate-pulse rounded" />
      <div className="bg-background-subtle h-5 w-10 animate-pulse rounded" />
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="bg-background-subtle h-3 w-20 animate-pulse rounded" />
      <div className="flex items-center gap-2">
        <div className="bg-background-subtle size-8 shrink-0 animate-pulse rounded-full" />
        <div className="bg-background-subtle h-4 w-28 animate-pulse rounded" />
      </div>
      <div className="bg-background-subtle mt-auto h-8 w-full max-w-[200px] animate-pulse rounded-lg" />
    </div>
    {showTutorActions ? (
      <div className="flex shrink-0 flex-col gap-1">
        <div className="bg-background-subtle size-8 animate-pulse rounded-lg" />
        <div className="bg-background-subtle size-8 animate-pulse rounded-lg" />
        <div className="bg-background-subtle size-8 animate-pulse rounded-lg" />
      </div>
    ) : null}
  </div>
);

export const AllLessons = ({
  lessons,
  dayDate,
  isLoading = false,
  showLessonActions = true,
  showTutorActions = true,
  onReschedule,
  onSaveLesson,
  onAddLesson,
}: AllLessonsProps) => {
  const { t } = useTranslation('main');
  const nearestIndex = useMemo(
    () => findNearestLessonIndex(lessons, new Date(), dayDate),
    [lessons, dayDate],
  );

  return (
    <DayLessonListMetaProvider>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {isLoading ? (
          <div className={cn('mr-2 flex flex-col gap-3 pr-0', galleryShadowPadClass)}>
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <LessonCardSkeleton key={i} showTutorActions={showTutorActions} />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div
            className={cn(
              'bg-background-surface mr-2 mb-3 flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-5 rounded-2xl px-4 py-8',
              'shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]',
            )}
          >
            <EmptySchedule
              className="mb-4 h-auto w-full max-w-[220px] shrink-0 object-contain"
              aria-hidden
            />
            <div className="flex max-w-md flex-col gap-2 text-center">
              <p className="text-m-base text-text-primary font-semibold">
                {t('lessons.emptyTitle')}
              </p>
              <p className="text-s-base text-text-secondary dark:text-text-muted">
                {onAddLesson
                  ? t('lessons.emptyTutorDescription')
                  : t('lessons.emptyStudentDescription')}
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
                {t('lessons.assignLesson')}
                <Add className="fill-icon-primary ml-1 size-4 shrink-0" />
              </Button>
            ) : null}
          </div>
        ) : (
          <ScrollArea className="h-auto max-h-full min-h-0 w-full">
            <div className={cn('mr-2 flex flex-col gap-3 pr-0 pb-2', galleryShadowPadClass)}>
              {lessons.map((lesson, index) => (
                <DayLessonRow
                  key={lesson.id}
                  lesson={lesson}
                  lessonDay={dayDate}
                  variant="card"
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
