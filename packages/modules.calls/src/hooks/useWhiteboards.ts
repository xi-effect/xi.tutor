import { useFetchMaterials } from 'common.services';
import { MaterialsKindT } from 'common.api';

export const useWhiteboards = (limit: number = 20) => {
  const { data, isError, isLoading, ...rest } = useFetchMaterials(
    limit,
    'board' as MaterialsKindT,
    undefined, // lastOpenedBefore - не используем для простого получения
    false, // disabled - всегда активен
  );

  return {
    whiteboards: data?.results || [],
    isError,
    isLoading,
    ...rest,
  };
};
