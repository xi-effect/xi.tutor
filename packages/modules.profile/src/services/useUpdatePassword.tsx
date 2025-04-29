import { userApiConfig, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Определяем тип для данных обновления пароля
export type PasswordData = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();

  const updatePasswordMutation = useMutation({
    mutationFn: async (passwordData: PasswordData) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: userApiConfig[UserQueryKey.Password].method,
          url: userApiConfig[UserQueryKey.Password].getUrl(),
          data: passwordData,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response;
      } catch (err) {
        console.error('Ошибка при обновлении пароля:', err);
        throw err;
      }
    },
    onSuccess: () => {
      // Инвалидируем кеш текущего пользователя, чтобы обновить данные
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    },
  });

  return { updatePassword: updatePasswordMutation };
};
