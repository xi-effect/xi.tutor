import { authApiConfig, AuthQueryKey, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from 'common.services';
import { AxiosError } from 'axios';

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
      console.log('err', err);
      // Для ошибки 409 (почта уже подтверждена) не показываем toast
      if (err instanceof AxiosError && err.response?.status === 409) {
        return;
      }
      handleError(err, 'emailConfirmationRequest');
    },
    onSuccess: () => {
      // Инвалидируем данные пользователя после успешного подтверждения email
      // Это обновит onboarding_stage с 'email-confirmation' на 'user-information'
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    },
    onSettled: () => {
      // Гарантируем, что мутация завершится в любом случае
      // Это помогает React Query правильно обновить состояние мутации
    },
  });

  // Проверяем, является ли ошибка 409 (почта уже подтверждена)
  const isAlreadyConfirmed =
    emailConfirmationMutation.isError &&
    emailConfirmationMutation.error instanceof AxiosError &&
    emailConfirmationMutation.error.response?.status === 409;

  return {
    emailConfirmation: emailConfirmationMutation,
    isLoading: emailConfirmationMutation.isPending,
    isSuccess: emailConfirmationMutation.isSuccess,
    isError: emailConfirmationMutation.isError,
    isAlreadyConfirmed,
  };
};
