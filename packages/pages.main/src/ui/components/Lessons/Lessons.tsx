import { Button } from '@xipkg/button';
import { Add, Undo } from '@xipkg/icons';
import { AddingLessonModal } from 'features.lesson.add';
import { useMemo, useState } from 'react';
import { AllLessons } from './AllLessons';
import { ScheduleDateCarousel } from 'modules.calendar';
import type { DominantVisibleMonthInfo, ScheduleLessonRow } from 'modules.calendar';

// TODO: Заменить на данные из API по выбранной дате (selectedDate)
export const MOCK_LESSONS: ScheduleLessonRow[] = [
  {
    id: 1,
    startTime: '15:45',
    endTime: '16:30',
    subject: 'Математика',
    studentName: 'Иван Петров',
    studentId: 2,
  },
  {
    id: 2,
    startTime: '16:45',
    endTime: '17:30',
    subject: 'Физика',
    studentName: 'Анна Кузнецова',
    studentId: 3,
  },
  {
    id: 3,
    startTime: '17:45',
    endTime: '18:30',
    subject: 'Химия',
    studentName: 'Олег Смирнов',
    studentId: 4,
  },
  {
    id: 4,
    startTime: '19:45',
    endTime: '20:30',
    subject: 'История',
    studentName: 'Елена Федорова',
    studentId: 5,
  },
  {
    id: 2,
    startTime: '20:45',
    endTime: '21:30',
    subject: 'Физика',
    studentName: 'Анна Кузнецова',
    studentId: 3,
  },
  {
    id: 3,
    startTime: '22:45',
    endTime: '23:30',
    subject: 'Химия',
    studentName: 'Олег Смирнов',
    studentId: 4,
  },
];

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

  const dayLessonsForModal: ScheduleLessonRow[] = MOCK_LESSONS;

  return (
    <>
      <AddingLessonModal open={open} onOpenChange={setOpen} dayLessons={dayLessonsForModal} />
      <div className="bg-gray-0 flex h-[calc(100vh-98px)] w-(--lessons-panel-width) flex-col gap-4 rounded-2xl p-4 pr-2 pl-5">
        {/* Заголовок */}
        <div className="flex flex-row items-center justify-between gap-2 pr-3">
          <div className="flex min-w-0 flex-row items-baseline gap-3">
            <h2 className="text-l-base 2xl:text-xl-base m-0 shrink-0 font-medium text-gray-100">
              Расписание
            </h2>
            {monthLabelInHeader ? (
              <span className="text-m-base 2xl:text-l-base text-gray-60 truncate font-normal">
                {monthLabelInHeader}
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-row items-center gap-2">
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
            <Button
              variant="none"
              className="bg-brand-0 hover:bg-brand-20/50 active:bg-brand-20/50 flex h-8 w-10 items-center justify-center rounded-lg p-0"
              onClick={() => setOpen(true)}
              data-umami-event="add-lesson-button"
              id="add-lesson-button"
            >
              <Add className="fill-brand-80 size-6" />
            </Button>
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

        {/* Список занятий на выбранный день */}
        <AllLessons lessons={MOCK_LESSONS} />
      </div>
    </>
  );
};
