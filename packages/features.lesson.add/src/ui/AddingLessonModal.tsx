import { useState } from 'react';
import { Modal, ModalContent, ModalCloseButton, ModalBody } from '@xipkg/modal';
import { Button } from '@xipkg/button';

import { DayLessonsPanel } from 'modules.calendar';
import type { ScheduleLessonRow } from 'modules.calendar';
import { AddingForm } from './components/AddingForm';
import './AddingModal.css';

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
};

export const AddingLessonModal = ({
  open,
  onOpenChange,
  dayLessons = [],
}: AddingLessonModalProps) => {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const handleCloseModal = () => {
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleCloseModal}>
      <ModalContent className="max-w-[960px]">
        <ModalCloseButton />
        <ModalBody className="flex max-h-[70vh] flex-row gap-10">
          <div className="flex min-h-0 w-1/2 min-w-0 flex-col gap-5">
            <h3 className="text-xl-base font-semibold text-gray-100">Расписание</h3>
            <DayLessonsPanel
              selectedDate={selectedDate}
              onSelectedDateChange={setSelectedDate}
              lessons={dayLessons}
            />
          </div>
          <div className="flex w-1/2 min-w-0 flex-col gap-5">
            <h3 className="text-xl-base font-semibold text-gray-100">Добавить занятие</h3>
            <AddingForm onClose={handleCloseModal} />
            <div className="flex flex-row gap-2">
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
