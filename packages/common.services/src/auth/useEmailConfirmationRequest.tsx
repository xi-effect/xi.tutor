import { authApiConfig, AuthQueryKey, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';

export const useEmailConfirmationRequest = () => {
  const queryClient = useQueryClient();

  const emailConfirmationRequestMutation = useMutation({
    mutationFn: async () => {
      const axiosInst = await getAxiosInstance();
      const response = await axiosInst({
        method: authApiConfig[AuthQueryKey.EmailConfirmationRequest].method,
        url: authApiConfig[AuthQueryKey.EmailConfirmationRequest].getUrl(),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response;
    },
    onError: (err) => {
      console.log('err', err);
      handleError(err, 'emailConfirmation');
    },
    onSuccess: () => {
      // Инвалидируем данные пользователя после успешного запроса подтверждения email
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
      showSuccess('profile', 'Письмо для подтверждения email было отправлено');
    },
    onSettled: () => {
      // Гарантируем, что мутация завершится в любом случае
      // Это помогает React Query правильно обновить состояние мутации
    },
  });

  return {
    emailConfirmationRequest: emailConfirmationRequestMutation,
    isLoading: emailConfirmationRequestMutation.isPending,
    isSuccess: emailConfirmationRequestMutation.isSuccess,
    isError: emailConfirmationRequestMutation.isError,
  };
};
