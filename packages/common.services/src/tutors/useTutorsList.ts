import { studentApiConfig, StudentQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useTutorsList = (options?: { disabled?: boolean }) => {
  const { method, getUrl } = studentApiConfig[StudentQueryKey.Tutors];

  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method,
      getUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled: options?.disabled,
    queryKey: [StudentQueryKey.Tutors],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
