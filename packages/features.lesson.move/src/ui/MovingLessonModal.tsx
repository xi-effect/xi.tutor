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
            <h3 className="text-xl-base shrink-0 font-semibold text-gray-100">Перенести занятие</h3>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <MovingForm onClose={handleCloseModal} initialDate={initialDate} />
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
