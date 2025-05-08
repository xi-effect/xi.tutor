import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApiConfig, AuthQueryKey } from 'common.api';
import { env } from 'common.env';
import { getAxiosInstance } from 'common.config';

export const useSignout = () => {
  const queryClient = useQueryClient();

  const signoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: authApiConfig[AuthQueryKey.Signout].method,
          url: authApiConfig[AuthQueryKey.Signout].getUrl(),
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
    },
    onSuccess: () => {
      // Очищаем кеш после успешного выхода
      queryClient.clear();
    },
  });

  return { signout: signoutMutation };
};
