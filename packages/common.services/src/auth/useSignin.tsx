import { useCallback } from 'react';
import { authApiConfig, AuthQueryKey } from 'common.api';
import { env } from 'common.env';
import { getAxiosInstance } from 'common.config';

export const useSignin = () => {
  const signin = useCallback(async (email: string, password: string) => {
    try {
      const axiosInst = await getAxiosInstance();
      const response = await axiosInst({
        method: authApiConfig[AuthQueryKey.Signin].method,
        url: authApiConfig[AuthQueryKey.Signin].getUrl(),
        data: { email, password },
        headers: {
          'Content-Type': 'application/json',
          'X-Testing': env.VITE_ENABLE_X_TESTING ? env.VITE_ENABLE_X_TESTING : 'false',
        },
      });

      return response;
    } catch (err) {
      console.error('Ошибка при выполнении запроса:', err);
      throw err;
    }
  }, []);

  return { signin };
};
