import { userApiConfig, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Определяем тип для данных обновления почты
export type EmailData = {
  new_email: string;
  password: string; // Для подтверждения действия
};

export const useUpdateEmail = () => {
  const queryClient = useQueryClient();

  const updateEmailMutation = useMutation({
    mutationFn: async (emailData: EmailData) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: userApiConfig[UserQueryKey.Email].method,
          url: userApiConfig[UserQueryKey.Email].getUrl(),
          data: emailData,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response;
      } catch (err) {
        console.error('Ошибка при обновлении почты:', err);
        throw err;
      }
    },
    onSuccess: () => {
      // Инвалидируем кеш текущего пользователя, чтобы обновить данные
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    },
  });

  return { updateEmail: updateEmailMutation };
};
