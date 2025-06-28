import { userApiConfig, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserData } from 'common.types';
import { handleError, showSuccess } from 'common.services';

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
    onMutate: async (emailData) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: [UserQueryKey.Home] });

      // Сохраняем предыдущее значение для отката
      const previousUser = queryClient.getQueryData<UserData>([UserQueryKey.Home]);

      // Оптимистично обновляем email и сбрасываем подтверждение
      queryClient.setQueryData<UserData>([UserQueryKey.Home], (old: UserData | undefined) => {
        if (!old) return old;
        return {
          ...old,
          email: emailData.new_email,
          email_confirmed: false, // После смены email требуется повторное подтверждение
        };
      });

      // Возвращаем предыдущее значение для отката в случае ошибки
      return { previousUser };
    },
    onError: (err, emailData, context) => {
      // В случае ошибки откатываем изменения
      if (context?.previousUser) {
        queryClient.setQueryData([UserQueryKey.Home], context.previousUser);
      }

      // Показываем toast с ошибкой
      handleError(err, 'email');
    },
    onSuccess: (response) => {
      // Если сервер вернул обновленные данные, обновляем кеш
      if (response?.data) {
        queryClient.setQueryData<UserData>([UserQueryKey.Home], response.data);
      }

      // Показываем успешное уведомление
      showSuccess('email');
    },
  });

  return { updateEmail: updateEmailMutation };
};
