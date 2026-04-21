import { useMemo } from 'react';
import { ClassroomT } from 'common.api';
import {
  useCurrentUser,
  useFetchClassrooms,
  useFetchClassroomsByStudent,
  useSubjectsById,
} from 'common.services';

const CLASSROOMS_LIMIT = 20;

const getAvatarUserId = (
  classroom: ClassroomT | undefined,
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
  subjectId?: number;
  /** Название предмета из API по `subject_id` кабинета; пусто, если у кабинета предмет не задан */
  subjectName?: string;
  classroomName: string;
  avatarUserId?: number;
  isLoading: boolean;
};

type UseLessonClassroomPresentationParamsT = {
  classroomId?: number;
  fallbackClassroomName: string;
  fallbackAvatarUserId?: number;
};

export const useLessonClassroomPresentation = ({
  classroomId,
  fallbackClassroomName,
  fallbackAvatarUserId,
}: UseLessonClassroomPresentationParamsT): LessonClassroomPresentationT => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const tutorClassrooms = useFetchClassrooms({ limit: CLASSROOMS_LIMIT }, !isTutor);
  const studentClassrooms = useFetchClassroomsByStudent({ limit: CLASSROOMS_LIMIT }, isTutor);

  const classrooms = isTutor ? tutorClassrooms.data : studentClassrooms.data;
  const isLoading = isTutor ? tutorClassrooms.isLoading : studentClassrooms.isLoading;

  const classroomsById = useMemo(
    () => new Map((classrooms ?? []).map((classroom) => [classroom.id, classroom])),
    [classrooms],
  );

  const classroom = classroomId != null ? classroomsById.get(classroomId) : undefined;

  const subjectId = classroom?.subject_id ?? undefined;
  const shouldLoadSubject = subjectId != null;
  const { data: subjectData } = useSubjectsById(subjectId ?? 0, !shouldLoadSubject);

  const subjectName = useMemo(() => {
    if (!shouldLoadSubject) return undefined;
    const name = subjectData?.name?.trim();
    return name || undefined;
  }, [shouldLoadSubject, subjectData?.name]);

  return {
    subjectId,
    subjectName,
    classroomName: classroom?.name ?? fallbackClassroomName,
    avatarUserId: getAvatarUserId(classroom, isTutor, fallbackAvatarUserId),
    isLoading,
  };
};
