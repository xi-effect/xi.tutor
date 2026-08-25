import { useQuery } from '@tanstack/react-query';
import { userApiConfig, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';

const currentUserQueryOptions = {
  queryKey: [UserQueryKey.Home],
  retry: false,
  retryOnMount: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
} as const;

export const useCurrentUser = (disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useQuery({
    ...currentUserQueryOptions,
    enabled: !disabled,
    queryFn: async () => {
      const axiosInstance = await getAxiosInstance();
      const response = await axiosInstance.get(userApiConfig[UserQueryKey.Home].getUrl(), {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    },
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
