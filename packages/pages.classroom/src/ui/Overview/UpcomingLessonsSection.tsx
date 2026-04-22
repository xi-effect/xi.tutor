import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { Add, Eyeon } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { ScrollArea } from '@xipkg/scrollarea';
import { useCurrentUser } from 'common.services';
import { useClassroomSchedule } from '../Calendar/ClassroomScheduleContext';
import { UpcomingLessonCard } from './UpcomingLessonCard';
import { getMockUpcomingLessons } from './getMockUpcomingLessons';

export const UpcomingLessonsSection = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { onAddLessonClick } = useClassroomSchedule();
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { classroomId: classroomIdParam } = useParams({
    from: '/(app)/_layout/classrooms/$classroomId/',
  });
  const classroomId = Number(classroomIdParam);

  const goSchedule = () => {
    const filteredSearch = search.call ? { call: search.call } : {};
    navigate({
      // @ts-expect-error TanStack Router search type
      search: { tab: 'schedule', ...filteredSearch },
    });
  };

  const lessons = getMockUpcomingLessons(classroomId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-2 pr-0 sm:pr-0">
        <h2 className="text-xl-base text-gray-100 first-letter:uppercase">Ближайшие занятия</h2>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="none"
            className="text-gray-60 hover:text-gray-80 flex h-8 w-8 items-center justify-center rounded-lg p-0"
            onClick={goSchedule}
            aria-label="Открыть расписание"
          >
            <Eyeon className="fill-gray-60 size-6" />
          </Button>
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
            {lessons.map((lesson, index) => (
              <UpcomingLessonCard
                key={lesson.id}
                lesson={lesson}
                classroomId={classroomId}
                isNearest={index === 0}
                onReschedule={goSchedule}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
