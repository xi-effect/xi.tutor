import { useCallback } from 'react';
import { Modal, ModalContent, ModalTitle, ModalBody } from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { toast } from 'sonner';
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
      toast.error('Не удалось определить кабинет для отмены занятия.');
      return;
    }
    if (schedulerMeta == null) {
      toast.error('Не удалось определить занятие для отмены.');
      return;
    }

    const target = buildOccurrenceCancellationParams({
      instanceKind: schedulerMeta.instanceKind,
      eventInstanceId: schedulerMeta.eventInstanceId,
      repetitionModeId: schedulerMeta.repetitionModeId,
      instanceIndex: schedulerMeta.instanceIndex,
    });

    if (target == null) {
      toast.error('Не удалось определить занятие для отмены.');
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
      toast.error('Не удалось определить кабинет для отмены занятия.');
      return;
    }
    if (schedulerMeta == null) {
      toast.error('Не удалось определить занятие для отмены.');
      return;
    }
    if (schedulerMeta.startsAt.trim().length === 0) {
      toast.error('Не удалось определить время занятия для отмены.');
      return;
    }

    const cancellationStartsAt = buildRepeatingCancellationStartsAt(schedulerMeta.startsAt);
    if (cancellationStartsAt == null) {
      toast.error('Не удалось определить время занятия для отмены.');
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
      <ModalContent className="w-full max-w-[480px]" aria-describedby={undefined}>
        <ModalTitle className="sr-only">Отменить занятие?</ModalTitle>
        <ModalBody className="flex flex-col items-center gap-4 p-6">
          <h3 className="text-xl-base text-text-primary font-semibold">Отменить занятие?</h3>
          <p className="text-m-base text-text-secondary text-center">
            Занятие нельзя будет восстановить после отмены
          </p>

          {isRecurring ? (
            <>
              <Button
                className="w-full"
                variant="primary"
                size="m"
                onClick={handleCancelThisOccurrence}
                disabled={isPending}
                data-umami-event="lesson-cancel-this"
              >
                Отменить это
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                size="m"
                onClick={handleCancelThisAndFollowing}
                disabled={isPending}
                data-umami-event="lesson-cancel-following"
              >
                Отменить это и все последующие
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              variant="primary"
              size="m"
              onClick={handleCancelThisOccurrence}
              disabled={isPending}
              data-umami-event="lesson-cancel-single"
            >
              Отменить занятие
            </Button>
          )}
          <Button
            variant="none"
            size="m"
            className="text-m-base text-text-primary w-full cursor-pointer font-semibold"
            onClick={handleClose}
            disabled={isPending}
            data-umami-event="lesson-cancel-dismiss"
          >
            Закрыть
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
