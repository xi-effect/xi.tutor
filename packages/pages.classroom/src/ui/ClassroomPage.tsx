import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import { useParams } from '@tanstack/react-router';
import { useGetClassroom } from 'common.services';

import { Header } from './Header';
import { TabsComponent } from './TabsComponent';

export const ClassroomPage = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));

  if (isLoading) {
    return (
      <div className="flex flex-col justify-between gap-6 pr-4 max-md:pl-4">
        <div className="flex flex-col gap-6 pt-1 max-md:gap-4">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-xl font-medium text-gray-900">Кабинет не найден</h2>
        <p className="text-gray-600">Проверьте правильность ссылки</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between gap-6 pr-4 max-md:pl-4">
      <div className="flex flex-col gap-6 pt-1 max-md:gap-4">
        <Header classroom={classroom} />
        <TabsComponent />
      </div>

      <div className="xs:hidden flex flex-row items-center justify-end">
        <Button
          size="small"
          className="fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-xl"
        >
          <Plus className="fill-brand-0" />
        </Button>
      </div>
    </div>
  );
};
