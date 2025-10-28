import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import { ClassroomMaterialsT } from 'common.types';

interface ClassroomMaterialsListParams {
  classroomId: string;
  content_type?: string | null;
  disabled?: boolean;
}

/**
 * Упрощенный хук для получения первых 50 материалов кабинета
 * Автоматически устанавливает limit=50 и не требует передачи cursor
 */
export const useGetClassroomMaterialsList = ({
  classroomId,
  content_type = null,
  disabled = false,
}: ClassroomMaterialsListParams) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.ClassroomMaterials].method,
      getUrl: () =>
        classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.ClassroomMaterials].getUrl(
          classroomId,
        ),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    data: {
      limit: 50,
      filters: {
        content_type,
      },
    },
    disabled: disabled || !classroomId,
    queryKey: [
      ClassroomMaterialsQueryKey.ClassroomMaterials,
      classroomId,
      content_type || 'all',
      'list',
    ],
  });

  return {
    data: data as ClassroomMaterialsT[],
    isError,
    isLoading,
    ...rest,
  };
};
