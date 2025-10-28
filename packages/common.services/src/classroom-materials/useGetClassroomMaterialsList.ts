import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

interface ClassroomMaterialsListParams {
  classroomId: string;
  content_type?: string | null;
  disabled?: boolean;
}

interface ClassroomMaterialsResponse {
  data: Array<{
    id: string;
    content_kind: 'note' | 'board';
    name: string;
    createdAt: string;
  }>;
  pagination: {
    has_more: boolean;
    next_cursor?: {
      created_at: string;
    };
  };
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
    data: data as ClassroomMaterialsResponse,
    isError,
    isLoading,
    ...rest,
  };
};
