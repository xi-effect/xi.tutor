import { studentsApiConfig, StudentsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useStudentsList = (options?: { disabled?: boolean }) => {
  const { method, getUrl } = studentsApiConfig[StudentsQueryKey.AllStudents];

  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method,
      getUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    },
    queryKey: [StudentsQueryKey.AllStudents],
    disabled: options?.disabled,
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
