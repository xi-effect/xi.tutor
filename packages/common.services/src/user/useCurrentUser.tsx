import { userApiConfig, UserQueryKey } from 'common.api';
import { useFetching } from 'common.config';

export const useCurrentUser = (disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: userApiConfig[UserQueryKey.Home].method,
      getUrl: () => userApiConfig[UserQueryKey.Home].getUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: [UserQueryKey.Home],
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};
