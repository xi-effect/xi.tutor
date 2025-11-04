import { authApiConfig, AuthQueryKey, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';

type EmailConfirmationData = {
  token: string;
};

export const useEmailConfirmation = () => {
  const queryClient = useQueryClient();

  const emailConfirmationMutation = useMutation({
    mutationFn: async (emailConfirmationData: EmailConfirmationData) => {
      const axiosInst = await getAxiosInstance();
      const response = await axiosInst({
        method: authApiConfig[AuthQueryKey.EmailConfirmation].method,
        url: authApiConfig[AuthQueryKey.EmailConfirmation].getUrl(),
        data: emailConfirmationData,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response;
    },
    onError: (err) => {
      handleError(err, 'email');
    },
    onSuccess: () => {
      // Инвалидируем данные пользователя после успешного подтверждения email
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
      showSuccess('profile', 'Email успешно подтвержден');
    },
    onSettled: () => {
      // Гарантируем, что мутация завершится в любом случае
      // Это помогает React Query правильно обновить состояние мутации
    },
  });

  return {
    emailConfirmation: emailConfirmationMutation,
    isLoading: emailConfirmationMutation.isPending,
    isSuccess: emailConfirmationMutation.isSuccess,
    isError: emailConfirmationMutation.isError,
  };
};
