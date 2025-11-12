import { userApiConfig, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError, showSuccess } from 'common.services';

type EmailChangeData = {
  token: string;
};

export const useEmailChange = () => {
  const queryClient = useQueryClient();

  const emailChangeMutation = useMutation({
    mutationFn: async (emailChangeData: EmailChangeData) => {
      const axiosInst = await getAxiosInstance();
      const response = await axiosInst({
        method: userApiConfig[UserQueryKey.EmailChange].method,
        url: userApiConfig[UserQueryKey.EmailChange].getUrl(),
        data: emailChangeData,
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
      // Инвалидируем данные пользователя после успешного изменения email
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
      showSuccess('profile', 'Email успешно изменен');
    },
    onSettled: () => {
      // Гарантируем, что мутация завершится в любом случае
      // Это помогает React Query правильно обновить состояние мутации
    },
  });

  return {
    emailChange: emailChangeMutation,
    isLoading: emailChangeMutation.isPending,
    isSuccess: emailChangeMutation.isSuccess,
    isError: emailChangeMutation.isError,
  };
};
