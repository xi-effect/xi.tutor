import { Button } from '@xipkg/button';
import { Add, Undo } from '@xipkg/icons';
import { AddingLessonModal } from 'features.lesson.add';
import { MovingLessonModal } from 'features.lesson.move';
import { useCallback, useMemo, useState } from 'react';
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

const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const Lessons = () => {
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
    const t = getToday();
    if (visibleMonthInfo.year === t.getFullYear() && visibleMonthInfo.monthIndex === t.getMonth()) {
      return null;
    }
    return visibleMonthInfo.label;
  }, [visibleMonthInfo]);

  const handleGoToToday = () => {
    setSelectedDate(getToday());
    setAlignCarouselNonce((n) => n + 1);
  };

  return (
    <>
      {isTutor ? (
        <AddingLessonModal
          open={open}
          onOpenChange={setOpen}
          scheduleListSeedDate={selectedDate}
          initialDate={selectedDate}
        />
      ) : null}
      <div className="bg-gray-0 flex h-[calc(100vh-98px)] w-(--lessons-panel-width) flex-col gap-4 rounded-2xl px-5 pt-4 pr-2 pb-1">
        {/* Заголовок */}
        <div className="flex flex-row items-center gap-2 pr-3">
          <div className="flex min-w-0 flex-1 flex-row items-baseline gap-3">
            <h2 className="text-l-base 2xl:text-xl-base m-0 shrink-0 font-medium text-gray-100">
              Расписание
            </h2>
            {monthLabelInHeader ? (
              <span className="text-m-base 2xl:text-l-base text-gray-60 truncate font-normal">
                {monthLabelInHeader}
              </span>
            ) : null}
          </div>
          <div className="ml-auto flex shrink-0 flex-row items-center gap-2">
            {!isTodayVisibleInCarousel ? (
              <Button
                variant="none"
                type="button"
                className="text-gray-60 hover:bg-gray-10 flex h-8 items-center gap-1 rounded-lg px-2.5"
                onClick={handleGoToToday}
                data-umami-event="schedule-go-to-today"
                id="schedule-go-to-today"
              >
                <Undo className="fill-gray-60 size-4 shrink-0" />
                <span className="text-s-base 2xl:text-m-base font-normal">К сегодня</span>
              </Button>
            ) : null}
            {isTutor ? (
              <Button
                variant="none"
                className="bg-brand-0 hover:bg-brand-20/50 active:bg-brand-20/50 flex h-8 w-10 items-center justify-center rounded-lg p-0"
                onClick={() => setOpen(true)}
                data-umami-event="add-lesson-button"
                id="add-lesson-button"
              >
                <Add className="fill-brand-80 size-6" />
              </Button>
            ) : null}
          </div>
        </div>

        {/* Карусель дат */}
        <ScheduleDateCarousel
          className="pr-3"
          selectedDate={selectedDate}
          onSelectedDateChange={setSelectedDate}
          alignCarouselNonce={alignCarouselNonce}
          onDominantVisibleMonthChange={setVisibleMonthInfo}
          onTodayVisibleInViewportChange={setIsTodayVisibleInCarousel}
        />

        {/* Список занятий на выбранный день — flex-1 + min-h-0, чтобы список / пустое состояние занимали оставшуюся высоту карточки */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AllLessons
            dayDate={selectedDate}
            lessons={lessonsForSelectedDay}
            isLoading={scheduleQuery.isLoading || scheduleQuery.isFetching}
            onReschedule={handleReschedule}
            onSaveLesson={isTutor ? handleSaveLesson : undefined}
            onAddLesson={isTutor ? () => setOpen(true) : undefined}
          />
        </div>
      </div>
      {moveLesson != null ? (
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
