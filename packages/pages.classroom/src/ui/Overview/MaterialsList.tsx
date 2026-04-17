import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomMaterialsList,
  useGetClassroomMaterialsListStudent,
} from 'common.services';
import { ClassroomMaterialsT } from 'common.types';
import { MaterialsCard } from 'features.materials.card';
import { MaterialsListSkeleton } from './MaterialsListSkeleton';

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
        {Array.from({ length: 3 }).map((_, i) => (
          <MaterialsListSkeleton key={i} className="h-33.5 w-[350px] min-w-[350px] 2xl:w-[430px]" />
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
        <MaterialsCard
          key={material.id}
          {...material}
          isLoading={isLoading}
          hasIcon
          className="w-auto min-w-[350px]"
        />
      ))}
    </div>
  );
};
