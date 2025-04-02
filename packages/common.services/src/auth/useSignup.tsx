import { useCallback } from 'react';
import { authApiConfig, AuthQueryKey } from 'common.api';
import { env } from 'common.env';
import { getAxiosInstance, type SignupData } from 'common.config';

export const useSignup = () => {
  const signup = useCallback(async (userData: SignupData) => {
    try {
      const axiosInst = await getAxiosInstance();
      const response = await axiosInst({
        method: authApiConfig[AuthQueryKey.Signup].method,
        url: authApiConfig[AuthQueryKey.Signup].getUrl(),
        data: userData,
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

  return { signup };
};
