import { userApiConfig, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserData } from 'common.types';
import { handleError, showSuccess } from 'common.services';

export type ResetPasswordData = {
  token: string;
  new_password: string;
};

export const useResetPasswordConfirm = () => {
  const queryClient = useQueryClient();

  const resetPasswordMutation = useMutation({
    mutationFn: async (resetPasswordData: ResetPasswordData) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: userApiConfig[UserQueryKey.PasswordResetConfirm].method,
          url: userApiConfig[UserQueryKey.PasswordResetConfirm].getUrl(),
          data: resetPasswordData,
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
      // Только если пользователь авторизован и данные есть в кеше
      if (previousUser) {
        queryClient.setQueryData<UserData>([UserQueryKey.Home], (old: UserData | undefined) => {
          if (!old) return old;
          return {
            ...old,
            last_password_change: new Date().toISOString(),
          };
        });
      }

      // Возвращаем предыдущее значение для отката в случае ошибки
      return { previousUser };
    },
    onError: (err, resetPasswordData, context) => {
      // В случае ошибки откатываем изменения
      if (context?.previousUser) {
        queryClient.setQueryData([UserQueryKey.Home], context.previousUser);
      }

      // Показываем toast с ошибкой
      handleError(err, 'resetPassword');
    },
    onSuccess: (response) => {
      // Если сервер вернул обновленные данные, обновляем кеш
      if (response?.data) {
        queryClient.setQueryData<UserData>([UserQueryKey.Home], response.data);
      }

      // Показываем успешное уведомление
      showSuccess('resetPassword');
    },
    onSettled: () => {
      // Для сброса пароля через публичный эндпоинт может потребоваться синхронизация
      // так как логика может быть сложнее и сервер может изменить дополнительные поля
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    },
  });

  return { resetPasswordConfirm: resetPasswordMutation };
};
