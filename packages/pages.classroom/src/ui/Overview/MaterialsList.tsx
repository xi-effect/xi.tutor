import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomMaterialsList,
  useGetClassroomMaterialsListStudent,
} from 'common.services';
import { ClassroomMaterialsT } from 'common.types';
import { MaterialsCard } from 'features.materials.card';

export const MaterialsList = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const getList = isTutor ? useGetClassroomMaterialsList : useGetClassroomMaterialsListStudent;

  // Получаем все материалы кабинета (и доски, и заметки)
  const {
    data: materials,
    isLoading,
    isError,
  } = getList({
    classroomId: classroomId || '',
    content_type: null, // null означает все типы материалов
    disabled: !classroomId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-row gap-8 pb-4">
        {[...new Array(3)].map((_, index) => (
          <div
            key={index}
            className="border-gray-30 bg-gray-0 flex min-h-24 min-w-[350px] animate-pulse flex-col items-start justify-start gap-2 rounded-2xl border p-4"
          >
            <div className="flex w-full flex-row items-center justify-between">
              <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex flex-col items-start justify-start gap-4">
              <div className="flex flex-row items-center justify-start gap-2">
                <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-24 w-full items-center justify-center">
        <p className="text-gray-50">Ошибка загрузки материалов</p>
      </div>
    );
  }

  // Если нет данных или пустой массив
  if (!materials || materials.length === 0) {
    return (
      <div className="flex h-24 w-full items-center justify-center">
        <p className="text-gray-50">Нет материалов</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-8 pb-4">
      {materials.map((material: ClassroomMaterialsT) => (
        <MaterialsCard key={material.id} {...material} isLoading={isLoading} hasIcon />
      ))}
    </div>
  );
};
