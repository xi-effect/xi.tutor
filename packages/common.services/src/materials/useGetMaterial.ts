import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { MaterialT } from 'common.types';
import { useFetching } from 'common.config';

export const useGetMaterial = ({ id, disabled }: { id: string; disabled?: boolean }) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: materialsApiConfig[MaterialsQueryKey.GetMaterial].method,
      getUrl: () => materialsApiConfig[MaterialsQueryKey.GetMaterial].getUrl(id),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: disabled || !id,
    queryKey: [MaterialsQueryKey.GetMaterial, id],
  });

  return {
    data: data as MaterialT,
    isError,
    isLoading,
    ...rest,
  };
};
