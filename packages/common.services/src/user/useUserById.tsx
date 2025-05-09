import { userApiConfig, UserQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useUserById = (id: string, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: userApiConfig[UserQueryKey.UserById].method,
      getUrl: () => userApiConfig[UserQueryKey.UserById].getUrl(id),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: [UserQueryKey.UserById, id],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
