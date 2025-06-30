import { userApiConfig, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserData } from 'common.types';
import { handleError, showSuccess } from 'common.services';

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
    onMutate: async () => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: [UserQueryKey.Home] });

      // Сохраняем предыдущее значение для отката
      const previousUser = queryClient.getQueryData<UserData>([UserQueryKey.Home]);

      // Оптимистично обновляем время последнего изменения пароля
      queryClient.setQueryData<UserData>([UserQueryKey.Home], (old: UserData | undefined) => {
        if (!old) return old;
        return {
          ...old,
          last_password_change: new Date().toISOString(),
        };
      });

      // Возвращаем предыдущее значение для отката в случае ошибки
      return { previousUser };
    },
    onError: (err, _passwordData, context) => {
      // В случае ошибки откатываем изменения
      if (context?.previousUser) {
        queryClient.setQueryData([UserQueryKey.Home], context.previousUser);
      }

      // Показываем toast с ошибкой
      handleError(err, 'password');
    },
    onSuccess: (response) => {
      // Если сервер вернул обновленные данные, обновляем кеш
      if (response?.data) {
        queryClient.setQueryData<UserData>([UserQueryKey.Home], response.data);
      }

      // Показываем успешное уведомление
      showSuccess('password');
    },
    onSettled: () => {
      // Для пароля может потребоваться синхронизация, так как сервер может изменить last_password_change
      // или другие поля, связанные с безопасностью
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    },
  });

  return { updatePassword: updatePasswordMutation };
};
