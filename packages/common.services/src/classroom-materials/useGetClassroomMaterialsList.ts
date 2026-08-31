import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import {
  buildClassroomMaterialFilters,
  ClassroomMaterialsT,
  serializeMaterialTagIds,
  YDocContentKind,
} from 'common.types';

interface ClassroomMaterialsListParams {
  classroomId: string;
  content_kind?: YDocContentKind | null;
  tag_ids?: number[] | null;
  disabled?: boolean;
}

export const useGetClassroomMaterialsList = ({
  classroomId,
  content_kind = null,
  tag_ids = null,
  disabled = false,
}: ClassroomMaterialsListParams) => {
  const filters = buildClassroomMaterialFilters({ content_kind, tag_ids });

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
      filters,
    },
    disabled: disabled || !classroomId,
    queryKey: [
      ClassroomMaterialsQueryKey.ClassroomMaterials,
      classroomId,
      content_kind || 'all',
      serializeMaterialTagIds(filters.tag_ids),
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
