import { useCallback, useState, type ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { AddingLessonModal } from 'features.lesson.add';
import type { FormData as AddingLessonFormData } from 'features.lesson.add';
import { useCreateClassroomEvent } from 'modules.calendar';
import { useCurrentUser, useGetClassroom } from 'common.services';
import { ClassroomScheduleProvider } from './scheduleContext';
import { buildCreateClassroomEventRequest } from './schedulerMapping';

export const ClassroomScheduleRoot = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const numericClassroomId = Number(classroomId);
  const { data: classroom } = useGetClassroom(numericClassroomId, isUserLoading || !isTutor);
  const createClassroomEvent = useCreateClassroomEvent();

  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [addLessonInitialDate, setAddLessonInitialDate] = useState<Date | null>(null);

  const handleAddLessonClick = useCallback((date?: Date) => {
    setAddLessonInitialDate(date ?? null);
    setAddLessonOpen(true);
  }, []);

  const handleAddLessonSubmit = async (data: AddingLessonFormData) => {
    await createClassroomEvent.mutateAsync({
      classroomId: numericClassroomId,
      body: buildCreateClassroomEventRequest(data),
      analytics: {
        source: 'classroom',
        lesson_type:
          classroom?.kind === 'group'
            ? 'group'
            : classroom?.kind === 'individual'
              ? 'individual'
              : 'unknown',
        is_recurring: data.repeatMode !== 'none',
        has_description: Boolean(data.description?.trim()),
      },
    });
  };

  return (
    <ClassroomScheduleProvider onAddLessonClick={isTutor ? handleAddLessonClick : undefined}>
      {children}
      {isTutor ? (
        <AddingLessonModal
          open={addLessonOpen}
          onOpenChange={setAddLessonOpen}
          initialDate={addLessonInitialDate}
          fixedClassroomId={numericClassroomId}
          onSubmit={handleAddLessonSubmit}
          analyticsSource="classroom"
        />
      ) : null}
    </ClassroomScheduleProvider>
  );
};
