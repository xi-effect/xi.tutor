import { useParams } from '@tanstack/react-router';
import { useGetClassroomMaterialsList, useDeleteClassroomMaterials } from 'common.services';
import { CardMaterials, type AccessTypesT } from '../CardMaterials';

export const MaterialsList = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });

  // Получаем все материалы кабинета (и доски, и заметки)
  const {
    data: materialsData,
    isLoading,
    isError,
  } = useGetClassroomMaterialsList({
    classroomId: classroomId || '',
    content_type: null, // null означает все типы материалов
    disabled: !classroomId,
  });

  // Хук для удаления материалов
  const { deleteClassroomMaterials } = useDeleteClassroomMaterials();

  // Обработчик удаления материала
  const handleDeleteMaterial = (
    materialId: string,
    materialName: string,
    contentKind: 'note' | 'board',
  ) => {
    if (classroomId) {
      deleteClassroomMaterials.mutate({
        classroomId,
        id: materialId,
        content_kind: contentKind,
        name: materialName,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-row gap-8 pb-4">
        {[...new Array(3)].map((_, index) => (
          <div
            key={index}
            className="border-gray-30 bg-gray-0 flex min-h-[96px] min-w-[350px] animate-pulse flex-col items-start justify-start gap-2 rounded-2xl border p-4"
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
      <div className="flex h-[96px] w-full items-center justify-center">
        <p className="text-gray-50">Ошибка загрузки материалов</p>
      </div>
    );
  }

  // Если нет данных или пустой массив
  if (!materialsData?.data || materialsData.data.length === 0) {
    return (
      <div className="flex h-[96px] w-full items-center justify-center">
        <p className="text-gray-50">Нет материалов</p>
      </div>
    );
  }

  // Преобразуем данные API в формат, ожидаемый CardMaterials
  const materials: AccessTypesT[] = materialsData.data.map((material) => ({
    id: Number(material.id),
    name: material.name,
    date: material.createdAt,
    typeWork: 'collaboration' as const, // По умолчанию, можно будет расширить в будущем
    typeMaterial: material.content_kind === 'board' ? 'board' : 'text',
    onDelete: () => handleDeleteMaterial(material.id, material.name, material.content_kind),
  }));

  return (
    <div className="flex flex-row gap-8 pb-4">
      {materials.map((material) => (
        <CardMaterials key={material.id} accessTypes={material} />
      ))}
    </div>
  );
};
