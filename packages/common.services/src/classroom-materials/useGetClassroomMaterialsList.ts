import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import { ClassroomMaterialsT, YDocContentKind } from 'common.types';

interface ClassroomMaterialsListParams {
  classroomId: string;
  content_kind?: YDocContentKind | null;
  disabled?: boolean;
}

export const useGetClassroomMaterialsList = ({
  classroomId,
  content_kind = null,
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
        content_kind: content_kind ?? null,
      },
    },
    disabled: disabled || !classroomId,
    queryKey: [
      ClassroomMaterialsQueryKey.ClassroomMaterials,
      classroomId,
      content_kind || 'all',
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
