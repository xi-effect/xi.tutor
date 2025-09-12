import { ClassroomsQueryKey, ClassroomT } from 'common.api';
import { useQuery } from '@tanstack/react-query';
import { getAxiosInstance } from 'common.config';
import { env } from 'common.env';

export const useFetchClassrooms = (
  searchParams?: {
    limit?: number;
    lastOpenedBefore?: string;
  },
  disabled?: boolean,
) => {
  const { data, isError, isLoading, ...rest } = useQuery({
    queryKey: [ClassroomsQueryKey.GetClassrooms, searchParams],
    queryFn: async () => {
      const axiosInst = await getAxiosInstance();
      const url = `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classrooms/`;

      const response = await axiosInst({
        method: 'GET',
        url,
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
