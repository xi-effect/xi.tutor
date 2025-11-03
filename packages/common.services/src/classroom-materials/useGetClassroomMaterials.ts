import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

interface ClassroomMaterialsSearchParams {
  classroomId: string;
  content_type?: string | null;
  limit?: number;
  cursor?: {
    created_at: string;
  };
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

export const useGetClassroomMaterials = (
  params: ClassroomMaterialsSearchParams,
  disabled?: boolean,
) => {
  const { classroomId, content_type = null, limit = 50, cursor } = params;

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
      cursor,
      limit,
      filters: {
        content_type,
      },
    },
    disabled: disabled || !classroomId,
    queryKey: [
      ClassroomMaterialsQueryKey.ClassroomMaterials,
      classroomId,
      content_type || 'all',
      limit,
      cursor?.created_at || 'initial',
    ],
  });

  return {
    data: data as ClassroomMaterialsResponse,
    isError,
    isLoading,
    ...rest,
  };
};
