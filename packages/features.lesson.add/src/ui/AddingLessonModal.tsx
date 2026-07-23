import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalTitle, ModalCloseButton, ModalBody } from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';

import { DayLessonsPanel } from 'modules.calendar';
import { AddingForm } from './components/AddingForm';
import './AddingModal.css';
import type { FormData } from '../model';
import {
  PRODUCT_ANALYTICS_EVENTS,
  trackProductEvent,
  type ProductAnalyticsSource,
} from 'common.utils';

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
  analyticsSource?: ProductAnalyticsSource;
};

export const AddingLessonModal = ({
  open,
  onOpenChange,
  scheduleListSeedDate,
  initialDate = null,
  fixedClassroomId,
  onSubmit,
  analyticsSource,
}: AddingLessonModalProps) => {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lessonCreateViewedForOpenRef = useRef(false);
  const handleSubmittingChange = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      lessonCreateViewedForOpenRef.current = false;
      return;
    }
    const seed = scheduleListSeedDate ?? initialDate;
    setSelectedDate(seed != null ? normalizeCalendarDay(seed) : getToday());

    if (lessonCreateViewedForOpenRef.current) return;
    lessonCreateViewedForOpenRef.current = true;
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.LESSON_CREATE_VIEWED, {
      source: analyticsSource ?? 'unknown',
    });
  }, [open, scheduleListSeedDate, initialDate, analyticsSource]);

  const handleCloseModal = () => {
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleCloseModal}>
      <ModalContent
        className="relative flex max-h-[min(100dvh,100%)] min-h-0 w-full max-w-[960px] min-w-0 flex-col md:min-h-[min(740px,100dvh)]"
        aria-describedby={undefined}
      >
        <ModalTitle className="sr-only">Добавить занятие</ModalTitle>
        <ModalCloseButton
          variant="full"
          className="bg-background-page top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full px-0 pt-0"
        >
          <Close className="fill-icon-primary h-5 w-5" />
        </ModalCloseButton>
        <ModalBody className="grid min-h-0 w-full min-w-0 flex-1 grid-cols-1 items-start gap-6 overflow-hidden md:grid-cols-2 md:gap-10">
          <div className="hidden min-h-0 min-w-0 flex-col overflow-hidden md:flex">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <DayLessonsPanel
                scheduleHeadingTitle="Расписание"
                selectedDate={selectedDate}
                onSelectedDateChange={setSelectedDate}
                fetchEnabled={open}
                showLessonActions={false}
                isTutorEmptyState
              />
            </div>
          </div>
          <div className="flex h-full min-h-0 min-w-0 flex-col gap-5 overflow-hidden">
            <div className="flex h-8 shrink-0 items-center pr-12">
              <h3 className="text-xl-base text-text-primary m-0 leading-none font-semibold">
                Добавить занятие
              </h3>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <AddingForm
                onClose={handleCloseModal}
                initialDate={initialDate}
                fixedClassroomId={fixedClassroomId}
                onSubmit={onSubmit}
                analyticsSource={analyticsSource}
                onSubmittingChange={handleSubmittingChange}
              />
            </div>
            <div className="flex w-full min-w-0 shrink-0 flex-row gap-2">
              <Button
                className="bg-background-page hover:bg-background-subtle text-text-primary h-11 min-w-0 flex-1 font-medium"
                form="adding-lesson-form"
                size="m"
                variant="none"
                type="reset"
                disabled={isSubmitting}
                data-umami-event="lesson-add-cancel"
              >
                Отменить
              </Button>
              <Button
                className="h-11 min-w-0 flex-1"
                form="adding-lesson-form"
                variant="primary"
                type="submit"
                size="m"
                loading={isSubmitting}
                disabled={isSubmitting}
                data-umami-event="lesson-add-submit"
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
