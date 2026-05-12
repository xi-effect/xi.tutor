import { useMemo } from 'react';
import { useCurrentUser, useStudentSchedule, useTutorSchedule } from 'common.services';
import { getCalendarDayQueryRange } from '../utils/getCalendarDayQueryRange';
import { mapScheduleItemToLessonRow } from '../utils/mapScheduleItemToLessonRow';

type UseScheduleLessonRowsForDayParams = {
  day: Date;
  enabled: boolean;
};

export const useScheduleLessonRowsForDay = ({
  day,
  enabled,
}: UseScheduleLessonRowsForDayParams) => {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const range = useMemo(() => getCalendarDayQueryRange(day), [day]);

  const tutorScheduleQuery = useTutorSchedule({
    ...range,
    enabled: !isUserLoading && isTutor === true && enabled,
  });
  const studentScheduleQuery = useStudentSchedule({
    ...range,
    enabled: !isUserLoading && isTutor === false && enabled,
  });
  const scheduleQuery = isTutor ? tutorScheduleQuery : studentScheduleQuery;

  const lessons = useMemo(() => {
    const items = scheduleQuery.data ?? [];
    return items
      .filter((item) => item.cancelledAt == null)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .map(mapScheduleItemToLessonRow);
  }, [scheduleQuery.data]);

  const isScheduleLoading =
    enabled && (isUserLoading || scheduleQuery.isLoading || scheduleQuery.isFetching);

  return {
    lessons,
    isScheduleLoading,
  };
};
