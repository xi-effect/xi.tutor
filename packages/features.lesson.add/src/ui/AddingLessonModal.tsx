import { useState } from 'react';
import { Modal, ModalContent, ModalCloseButton, ModalBody } from '@xipkg/modal';
import { Button } from '@xipkg/button';

import { DayLessonsPanel } from 'modules.calendar';
import type { ScheduleLessonRow } from 'modules.calendar';
import { AddingForm } from './components/AddingForm';
import './AddingModal.css';

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

type AddingLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Занятия на день для левой панели (виджет дня). Если не передано — показывается пустой список */
  dayLessons?: ScheduleLessonRow[];
  /** Дата для предзаполнения поля «Дата» в форме (например, день колонки при клике на плюс в канбане) */
  initialDate?: Date | null;
};

export const AddingLessonModal = ({
  open,
  onOpenChange,
  dayLessons = [],
  initialDate = null,
}: AddingLessonModalProps) => {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const handleCloseModal = () => {
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleCloseModal}>
      <ModalContent className="min-h-[740px] max-w-[960px]">
        <ModalCloseButton />
        <ModalBody className="flex h-full flex-row gap-10">
          <div className="flex min-h-0 w-1/2 min-w-0 flex-col gap-5">
            <h3 className="text-xl-base font-semibold text-gray-100">Расписание</h3>
            <DayLessonsPanel
              selectedDate={selectedDate}
              onSelectedDateChange={setSelectedDate}
              lessons={dayLessons?.length ? dayLessons : MOCK_DAY_LESSONS}
              withoutTitle
            />
          </div>
          <div className="flex h-full w-1/2 min-w-0 flex-col gap-5">
            <h3 className="text-xl-base font-semibold text-gray-100">Добавить занятие</h3>
            <AddingForm onClose={handleCloseModal} initialDate={initialDate} />
            <div className="mt-auto flex flex-row gap-2">
              <Button
                className="w-full"
                form="adding-lesson-form"
                size="m"
                variant="text"
                type="reset"
              >
                Отменить
              </Button>
              <Button
                className="w-full"
                form="adding-lesson-form"
                variant="primary"
                type="submit"
                size="m"
              >
                Добавить
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
