import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import { YDocContentKind } from 'common.types';

interface ClassroomMaterialsSearchParams {
  classroomId: string;
  content_kind?: YDocContentKind | null;
  limit?: number;
  cursor?: {
    updated_at: string;
  };
}

interface ClassroomMaterialsResponse {
  data: Array<{
    id: string;
    content_kind: YDocContentKind;
    name?: string;
    updated_at: string;
  }>;
  pagination: {
    has_more: boolean;
    next_cursor?: {
      updated_at: string;
    };
  };
}

export const useGetClassroomMaterials = (
  params: ClassroomMaterialsSearchParams,
  disabled?: boolean,
) => {
  const { classroomId, content_kind = null, limit = 50, cursor } = params;

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
        content_kind: content_kind ?? null,
      },
    },
    disabled: disabled || !classroomId,
    queryKey: [
      ClassroomMaterialsQueryKey.ClassroomMaterials,
      classroomId,
      content_kind || 'all',
      limit,
      cursor?.updated_at || 'initial',
    ],
  });

  return {
    data: data as ClassroomMaterialsResponse,
    isError,
    isLoading,
    ...rest,
  };
};
