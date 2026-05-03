import { useCallback } from 'react';
import { Modal, ModalContent, ModalBody } from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { toast } from 'sonner';
import {
  buildOccurrenceCancellationParams,
  useCancelEventInstance,
  useCancelRepeatedVirtualInstance,
  useDeleteClassroomEvent,
} from 'common.services';

/**
 * Метаданные для отмены: POST по инстансу / виртуальному повтору + числовой event_id для
 * удаления серии из кабинета («это и все последующие»).
 */
export type LessonSchedulerMetaForCancel = {
  eventId: number;
  instanceKind: 'sole' | 'repeated_virtual' | 'repeated_persisted';
  eventInstanceId?: string;
  repetitionModeId?: string;
  instanceIndex?: number | null;
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
  const deleteClassroomEvent = useDeleteClassroomEvent();
  const isPending =
    cancelInstance.isPending || cancelVirtual.isPending || deleteClassroomEvent.isPending;

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
    deleteClassroomEvent.mutate(
      { classroomId, eventId: schedulerMeta.eventId },
      { onSuccess: finishSuccess },
    );
  };

  const isRecurring = schedulerMeta != null && schedulerMeta.instanceKind !== 'sole';

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="w-full max-w-[480px]">
        <ModalBody className="flex flex-col items-center gap-4 p-6">
          <h3 className="text-xl-base font-semibold text-gray-100">Отменить занятие?</h3>
          <p className="text-m-base text-gray-60 text-center">
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
              >
                Отменить это
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                size="m"
                onClick={handleCancelThisAndFollowing}
                disabled={isPending}
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
            >
              Отменить занятие
            </Button>
          )}
          <Button
            variant="none"
            size="m"
            className="text-m-base w-full cursor-pointer font-semibold text-gray-100"
            onClick={handleClose}
            disabled={isPending}
          >
            Закрыть
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
