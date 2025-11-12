import { materialsApiConfig, MaterialsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import { ClassroomMaterialsT } from 'common.types';

interface MaterialsListParams {
  content_type?: string | null;
  disabled?: boolean;
}

/**
 * Упрощенный хук для получения первых 50 материалов кабинета
 * Автоматически устанавливает limit=50 и не требует передачи cursor
 */
export const useGetMaterialsList = ({
  content_type = null,
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
      filters: {
        content_type,
      },
    },
    disabled: disabled,
    queryKey: [MaterialsQueryKey.Materials, content_type || 'all', 'list'],
  });

  return {
    data: data as ClassroomMaterialsT[],
    isError,
    isLoading,
    ...rest,
  };
};
