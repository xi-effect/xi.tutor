import { useMemo } from 'react';
import { useCurrentUser, useStudentSchedule, useTutorSchedule } from 'common.services';
import { useAppTimeZone } from 'common.ui';
import { getCalendarDayQueryRange, lessonStartsOnDay } from '../utils/getCalendarDayQueryRange';
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

  const timeZone = useAppTimeZone();
  const range = useMemo(() => getCalendarDayQueryRange(day, timeZone), [day, timeZone]);

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
      .filter((item) => item.cancelledAt == null && lessonStartsOnDay(item.startsAt, day, timeZone))
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .map((item) => mapScheduleItemToLessonRow(item, timeZone));
  }, [day, scheduleQuery.data, timeZone]);

  const isScheduleLoading =
    enabled && (isUserLoading || scheduleQuery.isLoading || scheduleQuery.isFetching);

  return {
    lessons,
    isScheduleLoading,
  };
};
