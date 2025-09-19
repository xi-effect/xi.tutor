import { subjectsApiConfig, SubjectsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useSubjectsById = (id: number, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: subjectsApiConfig[SubjectsQueryKey.GetSubjectById].method,
      getUrl: () => subjectsApiConfig[SubjectsQueryKey.GetSubjectById].getUrl(id),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: [SubjectsQueryKey.GetSubjectById, id],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
