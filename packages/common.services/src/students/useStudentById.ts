import { studentsApiConfig, StudentsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useStudentById = (id: number, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: studentsApiConfig[StudentsQueryKey.StudentById].method,
      getUrl: () => studentsApiConfig[StudentsQueryKey.StudentById].getUrl(id),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: [StudentsQueryKey.StudentById, id],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
