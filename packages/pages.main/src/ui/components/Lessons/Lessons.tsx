import { Button } from '@xipkg/button';
import { Add, Undo } from '@xipkg/icons';
import { AddingLessonModal } from 'features.lesson.add';
import { MovingLessonModal } from 'features.lesson.move';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AllLessons } from './AllLessons';
import {
  getCalendarDayQueryRange,
  ScheduleDateCarousel,
  useStudentSchedule,
  useTutorSchedule,
  useUpdateClassroomEvent,
} from 'modules.calendar';
import type {
  ChangeLessonFormData,
  DominantVisibleMonthInfo,
  ScheduleLessonRow,
} from 'modules.calendar';
import { useCurrentUser } from 'common.services';
import { movingPropsFromLessonRow, scheduleItemToLessonRow } from './scheduleHelpers';
import { WidgetHeader, widgetTitleClass } from '../WidgetHeader';
import { galleryShadowHeaderInsetClass } from '../galleryShadowClass';
import { cn } from '@xipkg/utils';
import { FORCE_MAIN_LISTS_LOADING } from '../../forceListsLoading';

const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const Lessons = () => {
  const { t } = useTranslation('main');
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [visibleMonthInfo, setVisibleMonthInfo] = useState<DominantVisibleMonthInfo | null>(null);
  const [alignCarouselNonce, setAlignCarouselNonce] = useState(0);
  const [isTodayVisibleInCarousel, setIsTodayVisibleInCarousel] = useState(true);
  const [moveLesson, setMoveLesson] = useState<ScheduleLessonRow | null>(null);

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const updateEvent = useUpdateClassroomEvent();

  const handleReschedule = useCallback((lesson: ScheduleLessonRow) => {
    setMoveLesson(lesson);
  }, []);

  const handleSaveLesson = useCallback(
    (lesson: ScheduleLessonRow, data: ChangeLessonFormData) => {
      if (lesson.classroomId == null || lesson.schedulerMeta == null) return;
      const description = data.description?.trim() ?? '';
      updateEvent.mutate({
        classroomId: lesson.classroomId,
        eventId: lesson.schedulerMeta.eventId,
        body: {
          name: data.title.trim(),
          description: description === '' ? null : description,
        },
      });
    },
    [updateEvent],
  );

  const range = useMemo(() => getCalendarDayQueryRange(selectedDate), [selectedDate]);
  const tutorScheduleQuery = useTutorSchedule({
    ...range,
    enabled: !isUserLoading && isTutor === true,
  });
  const studentScheduleQuery = useStudentSchedule({
    ...range,
    enabled: !isUserLoading && isTutor === false,
  });
  const scheduleQuery = isTutor ? tutorScheduleQuery : studentScheduleQuery;

  const lessonsForSelectedDay = useMemo<ScheduleLessonRow[]>(() => {
    const items = scheduleQuery.data ?? [];
    return items
      .filter((item) => item.cancelledAt == null)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .map(scheduleItemToLessonRow);
  }, [scheduleQuery.data]);

  const monthLabelInHeader = useMemo(() => {
    if (!visibleMonthInfo) return null;
    const today = getToday();
    if (
      visibleMonthInfo.year === today.getFullYear() &&
      visibleMonthInfo.monthIndex === today.getMonth()
    ) {
      return null;
    }
    return visibleMonthInfo.label;
  }, [visibleMonthInfo]);

  const handleGoToToday = () => {
    setSelectedDate(getToday());
    setAlignCarouselNonce((n) => n + 1);
  };

  const headerTitle = (
    <div className="flex min-w-0 flex-1 flex-row items-baseline gap-3">
      <h2 className={widgetTitleClass}>{t('lessons.title')}</h2>
      {monthLabelInHeader ? (
        <span className="text-m-base text-text-secondary truncate font-normal">
          {monthLabelInHeader}
        </span>
      ) : null}
    </div>
  );

  const headerActions = (
    <>
      {!isTodayVisibleInCarousel ? (
        <Button
          variant="none"
          type="button"
          className="text-text-secondary hover:bg-background-subtle flex h-8 items-center gap-1 rounded-lg px-2.5"
          onClick={handleGoToToday}
          data-umami-event="schedule-go-to-today"
          id="schedule-go-to-today"
        >
          <Undo className="fill-icon-secondary size-4 shrink-0" />
          <span className="text-s-base font-normal">{t('lessons.goToToday')}</span>
        </Button>
      ) : null}
      {isTutor ? (
        <Button
          variant="primary"
          className="flex size-10 items-center justify-center rounded-[10px] p-0"
          onClick={() => setOpen(true)}
          data-umami-event="add-lesson-button"
          id="add-lesson-button"
        >
          <Add className="fill-text-on-accent size-6" />
        </Button>
      ) : null}
    </>
  );

  return (
    <>
      {isTutor ? (
        <AddingLessonModal
          open={open}
          onOpenChange={setOpen}
          scheduleListSeedDate={selectedDate}
          initialDate={selectedDate}
          analyticsSource="main"
        />
      ) : null}
      <div className="flex h-[calc(100vh-40px)] w-(--lessons-panel-width) flex-col gap-4">
        {/* mr-2: дорожка под скроллбар, без лишнего зазора до карточек */}
        <div className={cn('mr-2 flex shrink-0 flex-col gap-3', galleryShadowHeaderInsetClass)}>
          <WidgetHeader title={headerTitle} actions={headerActions} />
          <ScheduleDateCarousel
            selectedDate={selectedDate}
            onSelectedDateChange={setSelectedDate}
            alignCarouselNonce={alignCarouselNonce}
            onDominantVisibleMonthChange={setVisibleMonthInfo}
            onTodayVisibleInViewportChange={setIsTodayVisibleInCarousel}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AllLessons
            dayDate={selectedDate}
            lessons={lessonsForSelectedDay}
            isLoading={
              FORCE_MAIN_LISTS_LOADING || scheduleQuery.isLoading || scheduleQuery.isFetching
            }
            showTutorActions={isTutor}
            onReschedule={isTutor ? handleReschedule : undefined}
            onSaveLesson={isTutor ? handleSaveLesson : undefined}
            onAddLesson={isTutor ? () => setOpen(true) : undefined}
          />
        </div>
      </div>
      {isTutor && moveLesson != null ? (
        <MovingLessonModal
          open
          onOpenChange={(open) => {
            if (!open) setMoveLesson(null);
          }}
          {...movingPropsFromLessonRow(moveLesson)}
        />
      ) : null}
    </>
  );
};
