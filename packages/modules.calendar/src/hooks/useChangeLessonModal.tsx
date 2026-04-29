import { useCallback, useState } from 'react';
import { ChangeLessonModal, type ChangeLessonFormData } from 'features.lesson.change';
import type { ScheduleLessonRow } from '../ui/types';

export type UseChangeLessonModalOptions = {
  onSaveLesson?: (lesson: ScheduleLessonRow, data: ChangeLessonFormData) => void;
};

function mapScheduleLessonToChangeProps(lesson: ScheduleLessonRow) {
  return {
    subject: lesson.subject,
    participantName: lesson.studentName,
    participantId: lesson.studentId,
    defaultTitle: lesson.subject,
    defaultDescription: lesson.description ?? '',
  };
}

/**
 * Состояние и разметка {@link ChangeLessonModal} для одного занятия в списке (см. {@link useCancelLessonModal}).
 */
export const useChangeLessonModal = (
  lesson: ScheduleLessonRow,
  { onSaveLesson }: UseChangeLessonModalOptions,
) => {
  const [open, setOpen] = useState(false);

  const handleSave = useCallback(
    (data: ChangeLessonFormData) => {
      onSaveLesson?.(lesson, data);
    },
    [lesson, onSaveLesson],
  );

  const changeLessonModal = (
    <ChangeLessonModal
      open={open}
      onOpenChange={setOpen}
      {...mapScheduleLessonToChangeProps(lesson)}
      onSave={handleSave}
    />
  );

  return {
    changeModalOpen: open,
    setChangeModalOpen: setOpen,
    changeLessonModal,
  };
};
