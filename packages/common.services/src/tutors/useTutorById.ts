import { studentApiConfig, StudentQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useTutorById = (id: number, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: studentApiConfig[StudentQueryKey.GetTutor].method,
      getUrl: () => studentApiConfig[StudentQueryKey.GetTutor].getUrl(id),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: [StudentQueryKey.GetTutor, id],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
