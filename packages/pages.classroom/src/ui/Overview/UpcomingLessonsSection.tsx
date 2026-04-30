import { useMemo } from 'react';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { Add } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { ScrollArea } from '@xipkg/scrollarea';
import { useCurrentUser } from 'common.services';
import {
  useTutorClassroomSchedule,
  useStudentClassroomSchedule,
  type ScheduleItem,
} from 'modules.calendar';
import type { ScheduleLessonRow } from 'modules.calendar';
import { useClassroomSchedule } from '../Calendar/ClassroomScheduleContext';
import { UpcomingLessonCard } from './UpcomingLessonCard';
import { UpcomingLessonCardSkeleton } from './UpcomingLessonCardSkeleton';

function getUpcomingRange() {
  const now = new Date();
  const happensAfter = now.toISOString();
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  const happensBefore = end.toISOString();
  return { happensAfter, happensBefore };
}

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function scheduleItemToRow(item: ScheduleItem): ScheduleLessonRow {
  const startDate = new Date(item.startsAt);
  const endDate = new Date(item.endsAt);
  return {
    id: item.eventId,
    classroomId: item.classroomId ?? undefined,
    startAt: startDate,
    startTime: formatTime(startDate),
    endTime: formatTime(endDate),
    subject: item.title,
    description: item.description ?? undefined,
    studentName: '',
    studentId: 0,
  };
}

export const UpcomingLessonsSection = () => {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { onAddLessonClick } = useClassroomSchedule();
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
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
  const isLoading = isUserLoading || scheduleQuery.isLoading;

  const lessons = useMemo<ScheduleLessonRow[]>(() => {
    if (!scheduleQuery.data) return [];
    return scheduleQuery.data
      .filter((item) => item.cancelledAt == null)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .map(scheduleItemToRow);
  }, [scheduleQuery.data]);

  const goSchedule = () => {
    const filteredSearch = search.call ? { call: search.call } : {};
    navigate({
      // @ts-expect-error TanStack Router search type
      search: { tab: 'schedule', ...filteredSearch },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-2 pr-0 sm:pr-0">
        <h2 className="text-xl-base text-gray-100 first-letter:uppercase">Ближайшие занятия</h2>
        <div className="flex items-center gap-1">
          {isTutor ? (
            <Button
              type="button"
              variant="none"
              className="bg-brand-0 hover:bg-brand-20/50 active:bg-brand-20/50 flex h-8 w-10 items-center justify-center rounded-lg p-0"
              onClick={() => onAddLessonClick?.()}
              aria-label="Добавить занятие"
            >
              <Add className="fill-brand-80 size-6" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-row">
        <ScrollArea
          className="min-h-[200px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
          scrollBarProps={{ orientation: 'horizontal' }}
        >
          <div className="flex w-max flex-row gap-4 pr-1 pb-4">
            {isLoading ? (
              <>
                <UpcomingLessonCardSkeleton />
                <UpcomingLessonCardSkeleton />
                <UpcomingLessonCardSkeleton />
              </>
            ) : lessons.length === 0 ? (
              <p className="text-gray-40 self-center text-sm">Ближайших занятий нет</p>
            ) : (
              lessons.map((lesson, index) => (
                <UpcomingLessonCard
                  key={`${lesson.classroomId}-${lesson.startAt?.toISOString()}`}
                  lesson={lesson}
                  classroomId={classroomId}
                  isNearest={index === 0}
                  onReschedule={goSchedule}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
