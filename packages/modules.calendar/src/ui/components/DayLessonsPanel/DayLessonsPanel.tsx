import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { Undo } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { EmptySchedule } from 'common.ui';
import type { DominantVisibleMonthInfo } from '../ScheduleDateCarousel';
import { ScheduleDateCarousel } from '../ScheduleDateCarousel';
import { DayLessonRow } from '../DayLessonRow';
import type { ChangeLessonFormData } from 'features.lesson.change';
import type { ScheduleLessonRow } from '../../types';
import { cn } from '@xipkg/utils';
import { useScheduleLessonRowsForDay } from '../../../hooks/useScheduleLessonRowsForDay';
import { DayLessonListMetaProvider } from '../../contexts/DayLessonListMetaContext';
import { findNearestLessonIndex } from '../../../utils/findNearestLessonIndex';

const SKELETON_COUNT = 4;

type DayLessonsPanelProps = {
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  /**
   * Запрос занятий на `selectedDate` с API пока включено (`fetchEnabled`).
   * Если указать `lessons` — список снаружи, запрос не делается.
   */
  fetchEnabled?: boolean;
  lessons?: ScheduleLessonRow[];
  /** Панель действий на карточке (начать занятие, иконки). По умолчанию выключено */
  showLessonActions?: boolean;
  /**
   * Верхний ряд как на главной: заголовок + доминирующий месяц карусели + «К сегодня»
   * (используется в модалках)
   */
  scheduleHeadingTitle?: string;
  /** Подзаголовок «Занятия на день» (вариант без главного заголовка) */
  subtitle?: boolean;
  /** Пустое состояние для репетитора (иначе — для ученика) */
  isTutorEmptyState?: boolean;
  onSaveLesson?: (lesson: ScheduleLessonRow, data: ChangeLessonFormData) => void;
  onReschedule?: (lesson: ScheduleLessonRow) => void;
};

const getTodayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const DayLessonsPanel = ({
  selectedDate,
  onSelectedDateChange,
  fetchEnabled = false,
  lessons: lessonsProp,
  showLessonActions = false,
  scheduleHeadingTitle,
  subtitle = false,
  isTutorEmptyState = false,
  onSaveLesson,
  onReschedule,
}: DayLessonsPanelProps) => {
  const { t } = useTranslation('calendar');
  const [visibleMonthInfo, setVisibleMonthInfo] = useState<DominantVisibleMonthInfo | null>(null);
  const [alignCarouselNonce, setAlignCarouselNonce] = useState(0);
  const [isTodayVisibleInCarousel, setIsTodayVisibleInCarousel] = useState(true);

  const remote = useScheduleLessonRowsForDay({
    day: selectedDate,
    enabled: fetchEnabled && lessonsProp === undefined,
  });

  const lessons = lessonsProp ?? remote.lessons;
  const isLoading = lessonsProp === undefined && fetchEnabled && remote.isScheduleLoading;

  const nearestIndex = useMemo(
    () => findNearestLessonIndex(lessons, new Date(), selectedDate),
    [lessons, selectedDate],
  );

  const monthLabelInToolbar = useMemo(() => {
    if (!visibleMonthInfo) return null;
    const t = getTodayStart();
    if (visibleMonthInfo.year === t.getFullYear() && visibleMonthInfo.monthIndex === t.getMonth()) {
      return null;
    }
    return visibleMonthInfo.label;
  }, [visibleMonthInfo]);

  const handleGoToToday = () => {
    onSelectedDateChange(getTodayStart());
    setAlignCarouselNonce((n) => n + 1);
  };

  const goToTodayButton = (
    <Button
      variant="none"
      type="button"
      className="text-text-secondary hover:bg-background-subtle flex h-8 items-center gap-1 rounded-lg px-2.5"
      onClick={handleGoToToday}
      data-umami-event="modal-schedule-go-to-today"
    >
      <Undo className="fill-icon-secondary size-4 shrink-0" />
      <span className="text-s-base 2xl:text-m-base font-normal">{t('go_to_today')}</span>
    </Button>
  );

  return (
    <DayLessonListMetaProvider>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {scheduleHeadingTitle != null ? (
          <div className="flex h-8 shrink-0 flex-row items-center gap-2 pr-3">
            <div className="flex min-w-0 flex-1 flex-row items-center gap-3">
              <h3 className="text-xl-base text-text-primary m-0 shrink-0 leading-none font-semibold">
                {scheduleHeadingTitle}
              </h3>
              {monthLabelInToolbar ? (
                <span className="text-m-base 2xl:text-l-base text-text-secondary truncate font-normal">
                  {monthLabelInToolbar}
                </span>
              ) : null}
            </div>
            {!isTodayVisibleInCarousel ? (
              <div className="ml-auto flex shrink-0 flex-row items-center gap-2">
                {goToTodayButton}
              </div>
            ) : null}
          </div>
        ) : !isTodayVisibleInCarousel ? (
          <div className="flex shrink-0 flex-row items-center justify-end gap-2 pr-3">
            {goToTodayButton}
          </div>
        ) : null}

        {subtitle ? (
          <h3 className="text-l-base text-text-primary shrink-0 font-semibold">
            {t('lessons_for_day')}
          </h3>
        ) : null}

        <ScheduleDateCarousel
          className="pr-3"
          selectedDate={selectedDate}
          onSelectedDateChange={onSelectedDateChange}
          alignCarouselNonce={alignCarouselNonce}
          onDominantVisibleMonthChange={setVisibleMonthInfo}
          onTodayVisibleInViewportChange={setIsTodayVisibleInCarousel}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {isLoading ? (
            <div className="flex flex-col pr-3">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'border-border-default relative flex min-h-[136px] shrink-0 flex-row gap-4 p-4',
                    i < SKELETON_COUNT - 1 && 'border-b',
                  )}
                >
                  <div className="flex shrink-0 flex-col gap-2 pt-1">
                    <div className="bg-background-subtle h-5 w-14 animate-pulse rounded" />
                    <div className="bg-background-subtle h-4 w-10 animate-pulse rounded" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 pt-1">
                    <div className="bg-background-subtle h-3 w-16 animate-pulse rounded" />
                    <div className="bg-background-subtle h-6 w-32 animate-pulse rounded" />
                  </div>
                  <div className="absolute top-2 right-2 flex flex-1 flex-col gap-2 pt-1">
                    <div className="bg-background-subtle h-8 w-8 animate-pulse rounded" />
                    <div className="bg-background-subtle h-8 w-8 animate-pulse rounded" />
                    <div className="bg-background-subtle h-8 w-8 animate-pulse rounded" />
                  </div>
                  <div className="bg-background-subtle absolute right-12 bottom-3 h-8 w-[280px] animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : lessons.length === 0 ? (
            <div className="border-border-default bg-background-surface dark:border-border-strong mr-3 mb-3 flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-5 rounded-xl border border-dashed px-4 py-8 pr-3">
              <EmptySchedule
                className="mb-4 h-auto w-full max-w-[220px] shrink-0 object-contain"
                aria-hidden
              />
              <div className="flex max-w-md flex-col gap-2 text-center">
                <p className="text-m-base text-text-primary font-semibold">
                  {t('no_lessons_on_date')}
                </p>
                <p className="text-s-base text-text-secondary dark:text-text-muted">
                  {isTutorEmptyState ? t('empty_day_tutor_hint') : t('empty_day_student_hint')}
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="min-h-0 w-full flex-1">
              <div className="flex flex-col pr-3">
                {lessons.map((lesson, index) => (
                  <DayLessonRow
                    key={lesson.id}
                    lesson={lesson}
                    lessonDay={selectedDate}
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
      </div>
    </DayLessonListMetaProvider>
  );
};
