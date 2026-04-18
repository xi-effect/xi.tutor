import { useState } from 'react';
import { Modal, ModalContent, ModalCloseButton, ModalBody } from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { DayLessonsPanel } from 'modules.calendar';
import type { ScheduleLessonRow } from 'modules.calendar';
import { MovingForm } from './components/MovingForm';
import './MovingModal.css';

const MOCK_DAY_LESSONS: ScheduleLessonRow[] = [
  {
    id: 1,
    startTime: '10:00',
    endTime: '10:45',
    subject: 'Математика',
    studentName: 'Иван Петров',
    studentId: 2,
  },
  {
    id: 2,
    startTime: '11:00',
    endTime: '11:45',
    subject: 'Физика',
    studentName: 'Анна Кузнецова',
    studentId: 3,
  },
  {
    id: 3,
    startTime: '14:00',
    endTime: '14:45',
    subject: 'Химия',
    studentName: 'Олег Смирнов',
    studentId: 4,
  },
  {
    id: 4,
    startTime: '16:30',
    endTime: '17:15',
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

export type MovingLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayLessons?: ScheduleLessonRow[];
  initialDate?: Date | null;
  /** Предзаполнение времени из события (формат HH:MM) */
  initialStartTime?: string | null;
  initialEndTime?: string | null;
  /** Смена ключа пересоздаёт форму (например id занятия) */
  formKey?: string;
  /** Одноразовое занятие или входящее в серию повторений */
  lessonKind: 'one-off' | 'recurring';
  teacherName?: string;
  subjectLabel?: string;
  lessonTitle?: string;
  lessonDescription?: string;
  teacherAvatarUrl?: string | null;
  /** День недели серии (0 — пн), для подсказки при «Это занятие» */
  seriesWeekdayIndex?: number;
};

const DEFAULT_TEACHER = 'Анна Смирнова';
const DEFAULT_SUBJECT = 'Английский язык';
const DEFAULT_LESSON_TITLE = 'Изучаем что-то';

export const MovingLessonModal = ({
  open,
  onOpenChange,
  dayLessons = [],
  initialDate = null,
  initialStartTime = null,
  initialEndTime = null,
  formKey,
  lessonKind,
  teacherName = DEFAULT_TEACHER,
  subjectLabel = DEFAULT_SUBJECT,
  lessonTitle = DEFAULT_LESSON_TITLE,
  lessonDescription,
  teacherAvatarUrl = null,
  seriesWeekdayIndex = 0,
}: MovingLessonModalProps) => {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const handleCloseModal = () => {
    onOpenChange(false);
  };

  const formTitle =
    lessonKind === 'one-off' ? 'Перенести одноразовое занятие' : 'Перенести занятие';

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="flex max-h-[min(100dvh,100%)] min-h-0 w-full max-w-[960px] min-w-0 flex-col overflow-hidden md:min-h-[min(740px,100dvh)]">
        <ModalCloseButton />
        <ModalBody className="grid min-h-0 w-full min-w-0 flex-1 grid-cols-1 gap-6 overflow-hidden md:grid-cols-2 md:gap-10">
          <div className="hidden min-h-0 min-w-0 flex-col gap-5 overflow-hidden md:flex">
            <h3 className="text-xl-base shrink-0 font-semibold text-gray-100">Расписание</h3>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <DayLessonsPanel
                selectedDate={selectedDate}
                onSelectedDateChange={setSelectedDate}
                lessons={dayLessons?.length ? dayLessons : MOCK_DAY_LESSONS}
                withoutTitle
              />
            </div>
          </div>
          <div className="flex h-full min-h-0 min-w-0 flex-col gap-5 overflow-hidden">
            <h3 className="text-xl-base shrink-0 font-semibold text-gray-100">{formTitle}</h3>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <MovingForm
                key={formKey ?? lessonKind}
                onClose={handleCloseModal}
                initialDate={initialDate}
                initialStartTime={initialStartTime}
                initialEndTime={initialEndTime}
                lessonKind={lessonKind}
                teacherName={teacherName}
                subjectLabel={subjectLabel}
                lessonTitle={lessonTitle}
                lessonDescription={lessonDescription}
                teacherAvatarUrl={teacherAvatarUrl}
                seriesWeekdayIndex={seriesWeekdayIndex}
              />
            </div>
            <div className="flex w-full min-w-0 shrink-0 flex-row gap-2">
              <Button
                className="min-w-0 flex-1"
                form="moving-lesson-form"
                size="m"
                variant="text"
                type="reset"
              >
                Отменить
              </Button>
              <Button
                className="min-w-0 flex-1"
                form="moving-lesson-form"
                variant="primary"
                type="submit"
                size="m"
              >
                Перенести
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
