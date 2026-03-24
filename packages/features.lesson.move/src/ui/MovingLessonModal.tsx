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

type MovingLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayLessons?: ScheduleLessonRow[];
  initialDate?: Date | null;
};

export const MovingLessonModal = ({
  open,
  onOpenChange,
  dayLessons = [],
  initialDate = null,
}: MovingLessonModalProps) => {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const handleCloseModal = () => {
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleCloseModal}>
      <ModalContent className="flex min-h-[740px] w-full max-w-[960px] min-w-0 flex-col">
        <ModalCloseButton />
        <ModalBody className="grid min-h-0 w-full min-w-0 grid-cols-2 gap-10">
          <div className="flex min-h-0 min-w-0 flex-col gap-5">
            <h3 className="text-xl-base shrink-0 font-semibold text-gray-100">Расписание</h3>
            <DayLessonsPanel
              selectedDate={selectedDate}
              onSelectedDateChange={setSelectedDate}
              lessons={dayLessons?.length ? dayLessons : MOCK_DAY_LESSONS}
              withoutTitle
            />
          </div>
          <div className="flex h-full min-h-0 min-w-0 flex-col gap-5">
            <h3 className="text-xl-base shrink-0 font-semibold text-gray-100">Перенести занятие</h3>
            <MovingForm onClose={handleCloseModal} initialDate={initialDate} />
            <div className="mt-auto flex w-full min-w-0 flex-row gap-2">
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
