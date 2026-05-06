import { useCallback, useEffect, useState } from 'react';
import { Modal, ModalContent, ModalTitle, ModalCloseButton, ModalBody } from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { DayLessonsPanel } from 'modules.calendar';
import { MovingForm } from './components/MovingForm';
import type { RepeatedVirtualRescheduleTarget, SoleRescheduleTarget } from '../hooks';
import type { FormData } from '../model';
import './MovingModal.css';

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

export type MovingLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** День левой панели при открытии; по умолчанию из `initialDate` */
  scheduleListSeedDate?: Date | null;
  initialDate?: Date | null;
  /** Предзаполнение времени из события (формат HH:MM) */
  initialStartTime?: string | null;
  initialEndTime?: string | null;
  /** Смена ключа пересоздаёт форму (например id занятия) */
  formKey?: string;
  /** Одноразовое занятие или входящее в серию повторений */
  lessonKind: 'one-off' | 'recurring';
  /** id кабинета — для названия, предмета и аватара */
  classroomId?: number;
  /** id пользователя — запасной аватар */
  teacherId?: number;
  /** Запасное название кабинета */
  fallbackName?: string;
  lessonTitle?: string;
  lessonDescription?: string;
  /** День недели серии (0 — пн), для подсказки при «Это занятие» */
  seriesWeekdayIndex?: number;
  /**
   * UTC-битмаска серии из API (`weekly_starting_bitmask`).
   * Предзаполняет дни повторений в режиме «Это и следующие»
   * с автоматическим сдвигом UTC → локальный TZ пользователя.
   */
  weeklyBitmask?: number;
  /**
   * Параметры для переноса виртуального повторяющегося инстанса (`repeated_virtual`).
   * Если задан и `onSubmit` не передан — при сабмите вызывается PUT reschedule API.
   */
  schedulerTarget?: RepeatedVirtualRescheduleTarget;
  /**
   * Параметры для переноса инстанса с явным id (`sole` / `repeated_persisted`).
   * Если задан и `onSubmit` не передан — при сабмите вызывается PUT /event-instances/{id}/time-slot/.
   */
  soleTarget?: SoleRescheduleTarget;
  onSubmit?: (data: FormData) => void | Promise<void>;
};

const DEFAULT_LESSON_TITLE = 'Изучаем что-то';

export const MovingLessonModal = ({
  open,
  onOpenChange,
  scheduleListSeedDate,
  initialDate = null,
  initialStartTime = null,
  initialEndTime = null,
  formKey,
  lessonKind,
  classroomId,
  teacherId,
  fallbackName,
  lessonTitle = DEFAULT_LESSON_TITLE,
  lessonDescription,
  seriesWeekdayIndex = 0,
  weeklyBitmask,
  schedulerTarget,
  soleTarget,
  onSubmit,
}: MovingLessonModalProps) => {
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
    if (seed != null) {
      setSelectedDate(normalizeCalendarDay(seed));
    } else {
      setSelectedDate(getToday());
    }
  }, [open, scheduleListSeedDate, initialDate]);

  const handleCloseModal = () => {
    onOpenChange(false);
  };

  const formTitle = 'Перенести занятие';

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className="flex max-h-[min(100dvh,100%)] min-h-0 w-full max-w-[960px] min-w-0 flex-col overflow-hidden md:min-h-[min(740px,100dvh)]"
        aria-describedby={undefined}
      >
        <ModalTitle className="sr-only">{formTitle}</ModalTitle>
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
            <h3 className="text-xl-base shrink-0 font-semibold text-gray-100">{formTitle}</h3>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <MovingForm
                key={formKey ?? lessonKind}
                onClose={handleCloseModal}
                initialDate={initialDate}
                initialStartTime={initialStartTime}
                initialEndTime={initialEndTime}
                lessonKind={lessonKind}
                classroomId={classroomId}
                teacherId={teacherId}
                fallbackName={fallbackName}
                lessonTitle={lessonTitle}
                lessonDescription={lessonDescription}
                seriesWeekdayIndex={seriesWeekdayIndex}
                weeklyBitmask={weeklyBitmask}
                schedulerTarget={schedulerTarget}
                soleTarget={soleTarget}
                onSubmit={onSubmit}
                onSubmittingChange={handleSubmittingChange}
              />
            </div>
            <div className="flex w-full min-w-0 shrink-0 flex-row gap-2">
              <Button
                className="min-w-0 flex-1"
                form="moving-lesson-form"
                size="m"
                variant="text"
                type="reset"
                disabled={isSubmitting}
              >
                Отменить
              </Button>
              <Button
                className="min-w-0 flex-1"
                form="moving-lesson-form"
                variant="primary"
                type="submit"
                size="m"
                loading={isSubmitting}
                disabled={isSubmitting}
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
