import { ScheduleMobileView, useIsMobile } from 'modules.calendar';
import { useParams } from '@tanstack/react-router';
import { useCurrentUser, useGetClassroom, useGetClassroomStudent } from 'common.services';
import { useClassroomSchedule } from './ClassroomScheduleContext';
import { CalendarScheduleKanban } from './ClassroomScheduleParts';

export const Calendar = () => {
  const isMobile = useIsMobile();
  const { onAddLessonClick } = useClassroomSchedule();

  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const tutorQuery = useGetClassroom(Number(classroomId), isUserLoading || !isTutor);
  const studentQuery = useGetClassroomStudent(Number(classroomId), isUserLoading || isTutor);

  const classroom = isTutor ? tutorQuery.data : studentQuery.data;
  const isLoading = isUserLoading || (isTutor ? tutorQuery.isLoading : studentQuery.isLoading);
  const isError = isTutor ? tutorQuery.isError : studentQuery.isError;

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-xl font-medium text-gray-900">Ошибка загрузки данных</h2>
        <p className="text-gray-600">Не удалось загрузить календарь кабинета</p>
      </div>
    );
  }

  if (isMobile) {
    return <ScheduleMobileView onAddLessonClick={onAddLessonClick} />;
  }

  return (
    <div className="">
      <CalendarScheduleKanban />
    </div>
  );
};
