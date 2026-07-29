import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ModalContent, ModalTitle, ModalCloseButton, ModalBody } from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { DayLessonsPanel } from 'modules.calendar';
import { MovingForm } from './components/MovingForm';
import {
  useMovingRepetitionResolution,
  type RepeatedVirtualRescheduleTarget,
  type SoleRescheduleTarget,
} from '../hooks';
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
   * UTC-битмаска серии из API (`weekly_starting_bitmask`), если пришла в ответе расписания.
   * Для серий `daily` обычно отсутствует — тогда подсказка по `repetitionKind` или детальная ручка.
   */
  weeklyBitmask?: number;
  /** Режим повторения серии из расписания (тонкий инстанс вне детальной ручки). */
  repetitionKind?: 'daily' | 'weekly' | null;
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
  lessonTitle,
  lessonDescription,
  seriesWeekdayIndex = 0,
  weeklyBitmask,
  repetitionKind,
  schedulerTarget,
  soleTarget,
  onSubmit,
}: MovingLessonModalProps) => {
  const { t } = useTranslation('lessonMove');
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

  const movingRepetition = useMovingRepetitionResolution({
    enabled: open && lessonKind === 'recurring',
    schedulerTarget,
    soleTarget,
    scheduleWeeklyBitmaskUtc: weeklyBitmask,
    scheduleRepetitionKind: repetitionKind ?? null,
  });

  const formMovingRepetition = useMemo(() => {
    if (lessonKind !== 'recurring') {
      return { isDailySeries: false as const, bitmaskUtc: undefined as number | undefined };
    }
    return movingRepetition;
  }, [lessonKind, movingRepetition]);

  const handleCloseModal = () => {
    onOpenChange(false);
  };

  const formTitle = t('title');
  const resolvedLessonTitle = lessonTitle ?? t('defaultLessonTitle');

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className="relative flex max-h-[min(100dvh,100%)] min-h-0 w-full max-w-[960px] min-w-0 flex-col md:min-h-[min(740px,100dvh)]"
        aria-describedby={undefined}
      >
        <ModalTitle className="sr-only">{formTitle}</ModalTitle>
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
                scheduleHeadingTitle={t('schedule')}
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
                {formTitle}
              </h3>
            </div>
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
                lessonTitle={resolvedLessonTitle}
                lessonDescription={lessonDescription}
                seriesWeekdayIndex={seriesWeekdayIndex}
                movingRepetition={formMovingRepetition}
                schedulerTarget={schedulerTarget}
                soleTarget={soleTarget}
                onSubmit={onSubmit}
                onSubmittingChange={handleSubmittingChange}
              />
            </div>
            <div className="flex w-full min-w-0 shrink-0 flex-row gap-2">
              <Button
                className="bg-background-page hover:bg-background-subtle text-text-primary h-11 min-w-0 flex-1 font-medium"
                form="moving-lesson-form"
                size="m"
                variant="none"
                type="reset"
                disabled={isSubmitting}
                data-umami-event="lesson-move-cancel"
              >
                {t('cancel')}
              </Button>
              <Button
                className="h-11 min-w-0 flex-1"
                form="moving-lesson-form"
                variant="primary"
                type="submit"
                size="m"
                loading={isSubmitting}
                disabled={isSubmitting}
                data-umami-event="lesson-move-submit"
              >
                {t('submit')}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
