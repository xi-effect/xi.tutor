import { useCallback } from 'react';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  ModalCloseIcon,
  modalBodyClass,
  modalCancelButtonClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalDescriptionClass,
  modalFooterClass,
  modalHeaderRowClass,
  modalTitleClass,
} from 'common.ui';
import {
  buildOccurrenceCancellationParams,
  buildRepeatingCancellationStartsAt,
  useCancelEventInstance,
  useCancelRepeatedVirtualInstance,
  useCancelRepeatingEventAfterTimestamp,
} from 'common.services';

/**
 * Метаданные для отмены: POST по инстансу / виртуальному повтору + числовой event_id и
 * starts_at для отмены серии с выбранного вхождения («это и все последующие»).
 */
export type LessonSchedulerMetaForCancel = {
  eventId: number;
  /** ISO date-time начала вхождения (для POST .../events/{event_id}/cancellations/). */
  startsAt: string;
  instanceKind: 'sole' | 'repeated_virtual' | 'repeated_persisted';
  eventInstanceId?: string;
  repetitionModeId?: string;
  instanceIndex?: number | null;
  /** Режим серии повторений из расписания (тонкий инстанс без вложенного `repetition_mode`). */
  repetitionKind?: 'daily' | 'weekly' | null;
};

export type CancelLessonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroomId: number | null | undefined;
  schedulerMeta: LessonSchedulerMetaForCancel | null | undefined;
  /** После успешной отмены (закрыть родительские модалки и т.п.) */
  onSuccess?: () => void;
};

export const CancelLessonModal = ({
  open,
  onOpenChange,
  classroomId,
  schedulerMeta,
  onSuccess,
}: CancelLessonModalProps) => {
  const { t } = useTranslation('lessonCancel');
  const cancelInstance = useCancelEventInstance();
  const cancelVirtual = useCancelRepeatedVirtualInstance();
  const cancelRepeatingAfter = useCancelRepeatingEventAfterTimestamp();
  const isPending =
    cancelInstance.isPending || cancelVirtual.isPending || cancelRepeatingAfter.isPending;

  const handleClose = () => {
    onOpenChange(false);
  };

  const finishSuccess = useCallback(() => {
    onOpenChange(false);
    onSuccess?.();
  }, [onOpenChange, onSuccess]);

  const handleCancelThisOccurrence = () => {
    if (classroomId == null || classroomId <= 0) {
      toast.error(t('errors.classroomUnknown'));
      return;
    }
    if (schedulerMeta == null) {
      toast.error(t('errors.lessonUnknown'));
      return;
    }

    const target = buildOccurrenceCancellationParams({
      instanceKind: schedulerMeta.instanceKind,
      eventInstanceId: schedulerMeta.eventInstanceId,
      repetitionModeId: schedulerMeta.repetitionModeId,
      instanceIndex: schedulerMeta.instanceIndex,
    });

    if (target == null) {
      toast.error(t('errors.lessonUnknown'));
      return;
    }

    if (target.kind === 'instance') {
      cancelInstance.mutate(
        { classroomId, eventInstanceId: target.eventInstanceId },
        { onSuccess: finishSuccess },
      );
    } else {
      cancelVirtual.mutate(
        {
          classroomId,
          repetitionModeId: target.repetitionModeId,
          instanceIndex: target.instanceIndex,
        },
        { onSuccess: finishSuccess },
      );
    }
  };

  const handleCancelThisAndFollowing = () => {
    if (classroomId == null || classroomId <= 0) {
      toast.error(t('errors.classroomUnknown'));
      return;
    }
    if (schedulerMeta == null) {
      toast.error(t('errors.lessonUnknown'));
      return;
    }
    if (schedulerMeta.startsAt.trim().length === 0) {
      toast.error(t('errors.timeUnknown'));
      return;
    }

    const cancellationStartsAt = buildRepeatingCancellationStartsAt(schedulerMeta.startsAt);
    if (cancellationStartsAt == null) {
      toast.error(t('errors.timeUnknown'));
      return;
    }

    cancelRepeatingAfter.mutate(
      {
        classroomId,
        eventId: schedulerMeta.eventId,
        body: { starts_at: cancellationStartsAt },
      },
      { onSuccess: finishSuccess },
    );
  };

  const isRecurring = schedulerMeta != null && schedulerMeta.instanceKind !== 'sole';

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className={modalContentClass} aria-describedby={undefined}>
        <div className={modalBodyClass}>
          <div className={modalHeaderRowClass}>
            <ModalTitle className={modalTitleClass}>{t('title')}</ModalTitle>
            <ModalCloseIcon onClick={handleClose} disabled={isPending} />
          </div>
          <p className={modalDescriptionClass}>{t('description')}</p>

          {isRecurring ? (
            <div className="flex flex-col gap-3">
              <Button
                className={modalConfirmButtonClass}
                variant="primary"
                size="m"
                onClick={handleCancelThisOccurrence}
                disabled={isPending}
                data-umami-event="lesson-cancel-this"
              >
                {t('cancelThis')}
              </Button>
              <Button
                className={modalCancelButtonClass}
                variant="none"
                size="m"
                onClick={handleCancelThisAndFollowing}
                disabled={isPending}
                data-umami-event="lesson-cancel-following"
              >
                {t('cancelThisAndFollowing')}
              </Button>
            </div>
          ) : (
            <div className={modalFooterClass}>
              <Button
                variant="none"
                size="m"
                className={modalCancelButtonClass}
                onClick={handleClose}
                disabled={isPending}
                data-umami-event="lesson-cancel-dismiss"
              >
                {t('close')}
              </Button>
              <Button
                variant="error"
                size="m"
                className={modalConfirmButtonClass}
                onClick={handleCancelThisOccurrence}
                disabled={isPending}
                data-umami-event="lesson-cancel-single"
              >
                {t('cancelLesson')}
              </Button>
            </div>
          )}
          {isRecurring ? (
            <div className={modalFooterClass}>
              <Button
                variant="none"
                size="m"
                className={modalCancelButtonClass}
                onClick={handleClose}
                disabled={isPending}
                data-umami-event="lesson-cancel-dismiss"
              >
                {t('close')}
              </Button>
            </div>
          ) : null}
        </div>
      </ModalContent>
    </Modal>
  );
};
