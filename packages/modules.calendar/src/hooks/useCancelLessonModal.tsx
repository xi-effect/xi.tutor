import { useState } from 'react';
import { CancelLessonModal } from 'features.lesson.cancel';
import type { ScheduleLessonRow } from '../ui/types';

/**
 * Состояние и разметка {@link CancelLessonModal} для одного занятия — чтобы не дублировать модалку в строке, виджете и т.д.
 */
export const useCancelLessonModal = (lesson: ScheduleLessonRow) => {
  const [open, setOpen] = useState(false);

  const cancelLessonModal = (
    <CancelLessonModal
      open={open}
      onOpenChange={setOpen}
      classroomId={lesson.classroomId}
      schedulerMeta={lesson.schedulerMeta ?? null}
    />
  );

  return {
    cancelModalOpen: open,
    setCancelModalOpen: setOpen,
    cancelLessonModal,
  };
};
