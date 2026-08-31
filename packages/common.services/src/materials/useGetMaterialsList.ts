import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import {
  buildAnyMaterialFilters,
  MaterialScope,
  MaterialT,
  serializeMaterialScope,
  serializeMaterialTagIds,
  YDocContentKind,
} from 'common.types';

type YDocMaterialT = MaterialT & { content_kind: YDocContentKind };

interface MaterialsListParams {
  content_kind?: YDocContentKind | null;
  scope?: MaterialScope | null;
  tag_ids?: number[] | null;
  disabled?: boolean;
}

export const useGetMaterialsList = ({
  content_kind = null,
  scope,
  tag_ids = null,
  disabled = false,
}: MaterialsListParams) => {
  const filters = buildAnyMaterialFilters({ content_kind, scope, tag_ids });

  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: materialsApiConfig[MaterialsQueryKey.Materials].method,
      getUrl: () => materialsApiConfig[MaterialsQueryKey.Materials].getUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    data: {
      limit: 50,
      filters,
    },
    disabled: disabled,
    queryKey: [
      MaterialsQueryKey.Materials,
      content_kind || 'all',
      serializeMaterialScope(filters.scope),
      serializeMaterialTagIds(filters.tag_ids),
      'list',
    ],
  });

  return {
    data: data as YDocMaterialT[],
    isError,
    isLoading,
    ...rest,
  };
};
