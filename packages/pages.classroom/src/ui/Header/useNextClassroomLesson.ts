import { useMemo } from 'react';
import { useParams } from '@tanstack/react-router';
import { useCurrentUser } from 'common.services';
import {
  useTutorClassroomSchedule,
  useStudentClassroomSchedule,
  type ScheduleItem,
} from 'modules.calendar';

function getUpcomingRange() {
  const now = new Date();
  const happensAfter = now.toISOString();
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  const happensBefore = end.toISOString();
  return { happensAfter, happensBefore };
}

export const useNextClassroomLesson = () => {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { classroomId: classroomIdParam } = useParams({
    from: '/(app)/_layout/classrooms/$classroomId/',
  });
  const classroomId = Number(classroomIdParam);
  const range = useMemo(() => getUpcomingRange(), []);

  const tutorScheduleQuery = useTutorClassroomSchedule({
    classroomId,
    ...range,
    enabled: !isUserLoading && isTutor === true,
  });

  const studentScheduleQuery = useStudentClassroomSchedule({
    classroomId,
    ...range,
    enabled: !isUserLoading && isTutor === false,
  });

  const scheduleQuery = isTutor ? tutorScheduleQuery : studentScheduleQuery;

  const item = useMemo<ScheduleItem | null>(() => {
    if (!scheduleQuery.data) return null;
    const upcoming = scheduleQuery.data
      .filter((entry) => entry.cancelledAt == null)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    return upcoming[0] ?? null;
  }, [scheduleQuery.data]);

  return {
    item,
    isLoading: isUserLoading || scheduleQuery.isLoading,
  };
};
