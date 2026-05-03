import { useCallback, useEffect, useState } from 'react';
import { Modal, ModalContent, ModalCloseButton, ModalBody } from '@xipkg/modal';
import { Button } from '@xipkg/button';

import { DayLessonsPanel } from 'modules.calendar';
import { AddingForm } from './components/AddingForm';
import './AddingModal.css';
import type { FormData } from '../model';

const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const normalizeCalendarDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

type AddingLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * День расписания в левой панели при открытии (карусель и список).
   * По умолчанию совпадает с `initialDate`, иначе сегодня.
   */
  scheduleListSeedDate?: Date | null;
  /** Дата для предзаполнения поля «Дата» в форме */
  initialDate?: Date | null;
  fixedClassroomId?: number;
  onSubmit?: (data: FormData) => void | Promise<void>;
};

export const AddingLessonModal = ({
  open,
  onOpenChange,
  scheduleListSeedDate,
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
      return;
    }
    const seed = scheduleListSeedDate ?? initialDate;
    setSelectedDate(seed != null ? normalizeCalendarDay(seed) : getToday());
  }, [open, scheduleListSeedDate, initialDate]);

  const handleCloseModal = () => {
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleCloseModal}>
      <ModalContent className="flex max-h-[min(100dvh,100%)] min-h-0 w-full max-w-[960px] min-w-0 flex-col overflow-hidden md:min-h-[min(740px,100dvh)]">
        <ModalCloseButton />
        <ModalBody className="grid min-h-0 w-full min-w-0 flex-1 grid-cols-1 gap-6 overflow-hidden md:grid-cols-2 md:gap-10">
          <div className="hidden min-h-0 min-w-0 flex-col overflow-hidden md:flex">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <DayLessonsPanel
                scheduleHeadingTitle="Расписание"
                selectedDate={selectedDate}
                onSelectedDateChange={setSelectedDate}
                fetchEnabled={open}
                showLessonActions={false}
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
