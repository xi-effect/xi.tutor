import { enrollmentsApiConfig, EnrollmentsQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useGroupStudentsList = (
  classroomId: string,
  options?: {
    disabled?: boolean;
  },
) => {
  const { method, getUrl } = enrollmentsApiConfig[EnrollmentsQueryKey.GetAllStudents];

  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method,
      getUrl: () => getUrl(classroomId),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    queryKey: [EnrollmentsQueryKey.GetAllStudents, classroomId],
    disabled: options?.disabled,
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
