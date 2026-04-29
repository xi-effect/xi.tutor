import { useCallback, useEffect, useState } from 'react';
import { Modal, ModalContent, ModalCloseButton, ModalBody } from '@xipkg/modal';
import { Button } from '@xipkg/button';

import { DayLessonsPanel } from 'modules.calendar';
import type { ScheduleLessonRow } from 'modules.calendar';
import { AddingForm } from './components/AddingForm';
import './AddingModal.css';
import type { FormData } from '../model';

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
  fixedClassroomId?: number;
  onSubmit?: (data: FormData) => void | Promise<void>;
};

export const AddingLessonModal = ({
  open,
  onOpenChange,
  dayLessons = [],
  initialDate = null,
  fixedClassroomId,
  onSubmit,
}: AddingLessonModalProps) => {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmittingChange = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

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
                lessons={dayLessons}
                withoutTitle
              />
            </div>
          </div>
          <div className="flex h-full min-h-0 min-w-0 flex-col gap-5 overflow-hidden">
            <h3 className="text-xl-base shrink-0 font-semibold text-gray-100">Добавить занятие</h3>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <AddingForm
                onClose={handleCloseModal}
                initialDate={initialDate}
                fixedClassroomId={fixedClassroomId}
                onSubmit={onSubmit}
                onSubmittingChange={handleSubmittingChange}
              />
            </div>
            <div className="flex w-full min-w-0 shrink-0 flex-row gap-2">
              <Button
                className="min-w-0 flex-1"
                form="adding-lesson-form"
                size="m"
                variant="text"
                type="reset"
                disabled={isSubmitting}
              >
                Отменить
              </Button>
              <Button
                className="min-w-0 flex-1"
                form="adding-lesson-form"
                variant="primary"
                type="submit"
                size="m"
                loading={isSubmitting}
                disabled={isSubmitting}
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
