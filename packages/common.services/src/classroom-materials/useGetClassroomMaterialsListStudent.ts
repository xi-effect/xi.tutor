import { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import {
  buildClassroomMaterialFilters,
  ClassroomMaterialsT,
  serializeMaterialSearch,
  serializeMaterialTagIds,
  YDocContentKind,
} from 'common.types';

interface ClassroomMaterialsListParams {
  classroomId: string;
  content_kind?: YDocContentKind | null;
  search?: string | null;
  tag_ids?: number[] | null;
  disabled?: boolean;
}

export const useGetClassroomMaterialsListStudent = ({
  classroomId,
  content_kind = null,
  search = null,
  tag_ids = null,
  disabled = false,
}: ClassroomMaterialsListParams) => {
  const filters = buildClassroomMaterialFilters({ content_kind, search, tag_ids });

  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method:
        classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.ClassroomMaterialsStudent].method,
      getUrl: () =>
        classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.ClassroomMaterialsStudent].getUrl(
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
      ClassroomMaterialsQueryKey.ClassroomMaterialsStudent,
      classroomId,
      content_kind || 'all',
      serializeMaterialTagIds(filters.tag_ids),
      serializeMaterialSearch(filters.search),
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
