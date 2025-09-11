import { CalendarModule } from 'modules.calendar';
import { useParams } from '@tanstack/react-router';
import { useGetClassroom } from 'common.services';

export const Calendar = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));

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

  return (
    <div className="flex flex-col">
      <CalendarModule />
    </div>
  );
};
