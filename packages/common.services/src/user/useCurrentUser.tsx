import { userApiConfig, UserQueryKey } from 'common.api';
import { useFetching } from 'common.config';
// import { env } from "common.env";

export const useCurrentUser = (disabled: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: userApiConfig[UserQueryKey.Home].method,
      getUrl: () => userApiConfig[UserQueryKey.Home].getUrl(),
      // headers: {
      //   'Content-Type': 'application/json',
      //   'X-Testing': env.VITE_ENABLE_X_TESTING
      //     ? env.VITE_ENABLE_X_TESTING
      //     : 'false',
      // },
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
