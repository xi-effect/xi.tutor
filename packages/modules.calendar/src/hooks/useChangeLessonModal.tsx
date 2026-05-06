import { useCallback, useState } from 'react';
import { ChangeLessonModal, type ChangeLessonFormData } from 'features.lesson.change';
import type { ScheduleLessonRow } from '../ui/types';
import { useLessonClassroomPresentation } from './useLessonClassroomPresentation';

export type UseChangeLessonModalOptions = {
  /** Как у LessonCard внутри одного кабинета — без блока предмет/кабинет в модалке */
  hideClassroomAndSubject?: boolean;
  onSaveLesson?: (lesson: ScheduleLessonRow, data: ChangeLessonFormData) => void;
};

/**
 * Состояние и разметка {@link ChangeLessonModal} для одного занятия в списке (см. {@link useCancelLessonModal}).
 */
export const useChangeLessonModal = (
  lesson: ScheduleLessonRow,
  { onSaveLesson, hideClassroomAndSubject = false }: UseChangeLessonModalOptions,
) => {
  const [open, setOpen] = useState(false);

  const { classroomName, avatarUserId, subjectName } = useLessonClassroomPresentation({
    classroomId: lesson.classroomId,
    fallbackClassroomName: lesson.studentName,
    fallbackAvatarUserId: lesson.studentId,
    enabled: !hideClassroomAndSubject,
  });

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
      hideClassroomAndSubject={hideClassroomAndSubject}
      subjectName={subjectName}
      classroomName={classroomName}
      classroomLineUserId={avatarUserId ?? lesson.studentId ?? 0}
      defaultTitle={lesson.subject}
      defaultDescription={lesson.description ?? ''}
      onSave={handleSave}
    />
  );

  return {
    changeModalOpen: open,
    setChangeModalOpen: setOpen,
    changeLessonModal,
  };
};
