import { useCallback } from 'react';
import { authApiConfig, AuthQueryKey } from 'common.api';
import { env } from 'common.env';
import { getAxiosInstance } from 'common.config';

export const useRequestPasswordReset = () => {
  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const axiosInst = await getAxiosInstance();
      const response = await axiosInst({
        method: authApiConfig[AuthQueryKey.RequestPasswordReset].method,
        url: authApiConfig[AuthQueryKey.RequestPasswordReset].getUrl(),
        data: { email },
        headers: {
          'Content-Type': 'application/json',
          'X-Testing': !env.VITE_ENABLE_X_TESTING ? 'false' : env.VITE_ENABLE_X_TESTING,
        },
      });

      return response;
    } catch (err) {
      console.error('Ошибка при выполнении запроса:', err);
      throw err;
    }
  }, []);

  return { requestPasswordReset };
};
