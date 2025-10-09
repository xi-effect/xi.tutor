import { ClassroomT, studentApiConfig, StudentQueryKey } from 'common.api';
import { useQuery } from '@tanstack/react-query';
import { getAxiosInstance } from 'common.config';

export const useFetchClassroomsByStudent = (
  searchParams?: {
    limit?: number;
    lastOpenedBefore?: string;
  },
  disabled?: boolean,
) => {
  const { data, isError, isLoading, ...rest } = useQuery({
    queryKey: [StudentQueryKey.Classrooms, searchParams],
    queryFn: async () => {
      const axiosInst = await getAxiosInstance();

      const response = await axiosInst({
        method: studentApiConfig[StudentQueryKey.Classrooms].method,
        url: studentApiConfig[StudentQueryKey.Classrooms].getUrl(),
        params: {
          limit: searchParams?.limit || 20,
          last_opened_before: searchParams?.lastOpenedBefore,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data as ClassroomT[];
    },
    enabled: !disabled,
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
