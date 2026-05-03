import type { ClassroomTutorResponseSchema } from 'common.api';
import {
  useCurrentUser,
  useGetClassroom,
  useGetClassroomStudent,
  useSubjectsById,
} from 'common.services';

const getAvatarUserId = (
  classroom: ClassroomTutorResponseSchema | undefined,
  isTutor: boolean,
  fallbackUserId?: number,
): number | undefined => {
  if (!classroom) return fallbackUserId;

  if (classroom.kind === 'individual') {
    return isTutor
      ? (classroom.student_id ?? fallbackUserId)
      : (classroom.tutor_id ?? fallbackUserId);
  }

  return classroom.tutor_id ?? fallbackUserId;
};

export type LessonClassroomPresentationT = {
  /** Название предмета из API кабинета; undefined, если у кабинета предмет не задан */
  subjectName?: string;
  classroomName: string;
  avatarUserId?: number;
  isLoading: boolean;
};

type UseLessonClassroomPresentationParamsT = {
  classroomId?: number;
  fallbackClassroomName: string;
  fallbackAvatarUserId?: number;
  /** false — не запрашивать кабинет (например, когда строка кабинета/предмета в карточке скрыта) */
  enabled?: boolean;
};

export const useLessonClassroomPresentation = ({
  classroomId,
  fallbackClassroomName,
  fallbackAvatarUserId,
  enabled = true,
}: UseLessonClassroomPresentationParamsT): LessonClassroomPresentationT => {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  // Ждём загрузки пользователя, чтобы вызвать правильный endpoint (tutor vs student).
  const shouldFetch = enabled && classroomId != null && !isUserLoading && user != null;

  const tutorQuery = useGetClassroom(classroomId ?? 0, !isTutor || !shouldFetch);
  const studentQuery = useGetClassroomStudent(classroomId ?? 0, isTutor || !shouldFetch);

  const classroomQuery = isTutor ? tutorQuery : studentQuery;
  const classroom = classroomQuery.data;

  const subjectId = classroom?.subject_id ?? undefined;
  const { data: subjectData } = useSubjectsById(subjectId ?? 0, subjectId == null);

  if (!enabled) {
    return {
      subjectName: undefined,
      classroomName: fallbackClassroomName,
      avatarUserId: fallbackAvatarUserId,
      isLoading: false,
    };
  }

  const rawSubjectName = classroom?.subject?.name?.trim() || subjectData?.name?.trim() || undefined;

  return {
    subjectName: rawSubjectName || undefined,
    classroomName: classroom?.name ?? fallbackClassroomName,
    avatarUserId: getAvatarUserId(classroom, isTutor, fallbackAvatarUserId),
    isLoading: isUserLoading || classroomQuery.isLoading,
  };
};
