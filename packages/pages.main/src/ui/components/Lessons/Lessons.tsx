import { useNavigate } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { ArrowUpRight } from '@xipkg/icons';
import { AddingLessonModal } from 'features.lesson.add';
import { useState } from 'react';
import { AllLessons } from './AllLessons';
import { ScheduleDateCarousel } from 'modules.calendar';
import type { ScheduleLessonRow } from 'modules.calendar';

// TODO: Заменить на данные из API по выбранной дате (selectedDate)
const MOCK_LESSONS: ScheduleLessonRow[] = [
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
];

const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const Lessons = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getToday);

  const dayLessonsForModal: ScheduleLessonRow[] = MOCK_LESSONS;

  return (
    <>
      <AddingLessonModal open={open} onOpenChange={setOpen} dayLessons={dayLessonsForModal} />
      <div className="bg-gray-0 flex h-[calc(100vh-112px)] w-(--lessons-panel-width) flex-col gap-4 rounded-2xl p-4">
        {/* Заголовок */}
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex flex-row items-center gap-2">
            <h2 className="text-l-base 2xl:text-xl-base font-semibold text-gray-100">Расписание</h2>
          </div>
          <Button
            variant="none"
            size="s"
            className="text-gray-60 hover:text-gray-80 flex items-center gap-1.5 font-normal"
            onClick={() => navigate({ to: '/calendar' })}
          >
            Подробное
            <ArrowUpRight className="fill-brand-80 h-5 w-5" />
          </Button>
        </div>

        {/* Карусель дат */}
        <ScheduleDateCarousel selectedDate={selectedDate} onSelectedDateChange={setSelectedDate} />

        {/* Список занятий на выбранный день */}
        <AllLessons lessons={MOCK_LESSONS} />
      </div>
    </>
  );
};
