import { isClassroomInactive } from 'common.api';
import { useCurrentUser } from '../user';
import { useGetClassroom } from './useGetClassroom';
import { useGetClassroomStudent } from './useGetClassroomStudent';

export const useIsClassroomInactive = (classroomId?: number | string | null) => {
  const id = Number(classroomId);
  const disabled = !Number.isFinite(id) || id <= 0;
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const tutorQuery = useGetClassroom(id, disabled || isUserLoading || !isTutor);
  const studentQuery = useGetClassroomStudent(id, disabled || isUserLoading || isTutor);
  const status = (isTutor ? tutorQuery.data : studentQuery.data)?.status;

  return isClassroomInactive(status);
};

export const useIsClassroomOnPause = useIsClassroomInactive;
