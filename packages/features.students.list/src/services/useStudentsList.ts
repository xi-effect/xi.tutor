import { studentsApiConfig, StudentsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useStudentsList = () => {
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
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
