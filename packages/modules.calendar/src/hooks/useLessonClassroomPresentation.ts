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
  /** false — не запрашивать кабинеты и предмет (например, когда строка кабинета/предмета в карточке скрыта) */
  enabled?: boolean;
};

export const useLessonClassroomPresentation = ({
  classroomId,
  fallbackClassroomName,
  fallbackAvatarUserId,
  enabled = true,
}: UseLessonClassroomPresentationParamsT): LessonClassroomPresentationT => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const tutorClassrooms = useFetchClassrooms({ limit: CLASSROOMS_LIMIT }, !isTutor || !enabled);
  const studentClassrooms = useFetchClassroomsByStudent(
    { limit: CLASSROOMS_LIMIT },
    isTutor || !enabled,
  );

  const classrooms = isTutor ? tutorClassrooms.data : studentClassrooms.data;
  const isLoading = isTutor ? tutorClassrooms.isLoading : studentClassrooms.isLoading;

  const classroomsById = useMemo(
    () => new Map((classrooms ?? []).map((classroom) => [classroom.id, classroom])),
    [classrooms],
  );

  const classroom = classroomId != null ? classroomsById.get(classroomId) : undefined;

  const subjectId = classroom?.subject_id ?? undefined;
  const shouldLoadSubject = enabled && subjectId != null;
  const { data: subjectData } = useSubjectsById(subjectId ?? 0, !shouldLoadSubject);

  const subjectName = useMemo(() => {
    if (!enabled || !shouldLoadSubject) return undefined;
    const name = subjectData?.name?.trim();
    return name || undefined;
  }, [enabled, shouldLoadSubject, subjectData?.name]);

  if (!enabled) {
    return {
      subjectId: undefined,
      subjectName: undefined,
      classroomName: fallbackClassroomName,
      avatarUserId: fallbackAvatarUserId,
      isLoading: false,
    };
  }

  return {
    subjectId,
    subjectName,
    classroomName: classroom?.name ?? fallbackClassroomName,
    avatarUserId: getAvatarUserId(classroom, isTutor, fallbackAvatarUserId),
    isLoading,
  };
};
