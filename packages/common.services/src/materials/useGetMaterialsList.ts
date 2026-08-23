import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import { PersonalMaterialResponse, YDocContentKind } from 'common.types';

interface MaterialsListParams {
  content_kind?: YDocContentKind | null;
  disabled?: boolean;
}

/**
 * Первая страница personal materials.
 * list/search ручки нет в приложенном OpenAPI — запрос идёт на аналогичный searches path.
 */
export const useGetMaterialsList = ({
  content_kind = null,
  disabled = false,
}: MaterialsListParams) => {
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
      filters: content_kind ? { content_kind } : {},
    },
    disabled: disabled,
    queryKey: [MaterialsQueryKey.Materials, content_kind || 'all', 'list'],
  });

  return {
    data: data as PersonalMaterialResponse[],
    isError,
    isLoading,
    ...rest,
  };
};
