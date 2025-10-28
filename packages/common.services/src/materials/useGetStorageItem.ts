import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { StorageItemT } from 'common.types';
import { useFetching } from 'common.config';

export const useGetStorageItem = (id: string, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: materialsApiConfig[MaterialsQueryKey.StorageItem].method,
      getUrl: () => materialsApiConfig[MaterialsQueryKey.StorageItem].getUrl(id),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !id,
    queryKey: [MaterialsQueryKey.StorageItem, id],
  });

  return {
    data: data as StorageItemT,
    isError,
    isLoading,
    ...rest,
  };
};
