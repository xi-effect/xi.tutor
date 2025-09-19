import { subjectsApiConfig, SubjectsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useAutocompleteSubjects = (search: string, limit: number = 10, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: subjectsApiConfig[SubjectsQueryKey.SubjectsAutocomplete].method,
      getUrl: () => subjectsApiConfig[SubjectsQueryKey.SubjectsAutocomplete].getUrl(search, limit),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: [SubjectsQueryKey.SubjectsAutocomplete, search, limit],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
