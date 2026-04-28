import { useCallback, useMemo, useState } from 'react';
import type { CancelLessonVariant } from 'features.lesson.cancel';
import { CancelLessonModal } from 'features.lesson.cancel';
import type { ScheduleLessonRow } from '../ui/types';

type UseCancelLessonModalOptions = {
  onCancelOne?: (lesson: ScheduleLessonRow) => void;
  onCancelAll?: (lesson: ScheduleLessonRow) => void;
};

function cancelVariantFromLesson(lesson: ScheduleLessonRow): CancelLessonVariant {
  return lesson.instanceKind == null || lesson.instanceKind === 'sole' ? 'sole' : 'recurring';
}

/**
 * Состояние и разметка {@link CancelLessonModal} для одного занятия — чтобы не дублировать модалку в строке, виджете и т.д.
 */
export const useCancelLessonModal = (
  lesson: ScheduleLessonRow,
  { onCancelOne, onCancelAll }: UseCancelLessonModalOptions,
) => {
  const [open, setOpen] = useState(false);

  const variant = useMemo(() => cancelVariantFromLesson(lesson), [lesson]);

  const handleCancelOne = useCallback(() => {
    onCancelOne?.(lesson);
    setOpen(false);
  }, [lesson, onCancelOne]);

  const handleCancelAll = useCallback(() => {
    onCancelAll?.(lesson);
    setOpen(false);
  }, [lesson, onCancelAll]);

  const cancelLessonModal = (
    <CancelLessonModal
      open={open}
      onOpenChange={setOpen}
      variant={variant}
      onCancelOne={handleCancelOne}
      onCancelAll={handleCancelAll}
    />
  );

  return {
    cancelModalOpen: open,
    setCancelModalOpen: setOpen,
    cancelLessonModal,
  };
};
