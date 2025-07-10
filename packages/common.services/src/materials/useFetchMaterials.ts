import { materialsApiConfig, MaterialsQueryKey, MaterialsKindT } from 'common.api';
import { useFetching } from 'common.config';

export const useFetchMaterials = (
  limit: number,
  kind: MaterialsKindT,
  lastOpenedBefore?: string,
  disabled?: boolean,
) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: materialsApiConfig[MaterialsQueryKey.Materials].method,
      getUrl: () =>
        materialsApiConfig[MaterialsQueryKey.Materials].getUrl(limit, kind, lastOpenedBefore),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: lastOpenedBefore
      ? [MaterialsQueryKey.Materials, kind, lastOpenedBefore]
      : [MaterialsQueryKey.Materials, kind],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
