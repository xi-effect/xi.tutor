import { useParams } from '@tanstack/react-router';
import { useGetClassroom } from 'common.services';
import { Information } from './Information';
import { ClassroomT } from 'common.api';

export const InformationLayout = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="order-2 flex h-full w-full flex-1 justify-center md:order-1">
          <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
        </div>
        <div className="order-1 w-full md:order-2 md:w-[300px]">
          <div className="flex flex-col gap-6">
            <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-xl font-medium text-gray-900">Ошибка загрузки данных</h2>
        <p className="text-gray-600">Не удалось загрузить информацию о кабинете</p>
      </div>
    );
  }

  return <Information classroom={classroom as unknown as ClassroomT} />;
};
