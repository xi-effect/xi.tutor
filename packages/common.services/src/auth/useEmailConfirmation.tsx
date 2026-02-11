import { useEffect } from 'react';
import { authApiConfig, AuthQueryKey, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const useEmailConfirmation = (token: string | undefined) => {
  const queryClient = useQueryClient();
  const isValidToken = !!token && token !== 'confirm';

  const { error, isLoading, isSuccess, isError } = useQuery({
    queryKey: [AuthQueryKey.EmailConfirmation, token],
    queryFn: async () => {
      const axiosInst = await getAxiosInstance();
      const response = await axiosInst({
        method: authApiConfig[AuthQueryKey.EmailConfirmation].method,
        url: authApiConfig[AuthQueryKey.EmailConfirmation].getUrl(),
        data: { token },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    enabled: isValidToken,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Почта уже подтверждена (сервер вернул 409)
  const isAlreadyConfirmed =
    isError && error instanceof AxiosError && error.response?.status === 409;

  // Инвалидируем данные пользователя после успешного подтверждения
  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    }
  }, [isSuccess, queryClient]);

  return {
    isLoading,
    isSuccess,
    isError: isError && !isAlreadyConfirmed,
    isAlreadyConfirmed,
  };
};
