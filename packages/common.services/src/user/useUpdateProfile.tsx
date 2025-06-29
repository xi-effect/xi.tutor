import { userApiConfig, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserData, ProfileData } from 'common.types';
import { handleError, showSuccess } from 'common.services';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ProfileData) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: userApiConfig[UserQueryKey.Profile].method,
          url: userApiConfig[UserQueryKey.Profile].getUrl(),
          data: profileData,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response;
      } catch (err) {
        console.error('Ошибка при обновлении профиля:', err);
        throw err;
      }
    },
    onMutate: async (profileData) => {
      // Отменяем исходящие запросы, чтобы они не перезаписали наш оптимистичный апдейт
      await queryClient.cancelQueries({ queryKey: [UserQueryKey.Home] });

      // Сохраняем предыдущее значение для отката
      const previousUser = queryClient.getQueryData<UserData>([UserQueryKey.Home]);

      // Оптимистично обновляем данные пользователя
      queryClient.setQueryData<UserData>([UserQueryKey.Home], (old: UserData | undefined) => {
        if (!old) return old;
        return {
          ...old,
          ...profileData,
        };
      });

      // Возвращаем предыдущее значение для отката в случае ошибки
      return { previousUser };
    },
    onError: (err, _profileData, context) => {
      // В случае ошибки откатываем изменения
      if (context?.previousUser) {
        queryClient.setQueryData([UserQueryKey.Home], context.previousUser);
      }

      // Показываем toast с ошибкой
      handleError(err, 'profile');
    },
    onSuccess: (response) => {
      // Если сервер вернул обновленные данные, обновляем кеш
      if (response?.data) {
        queryClient.setQueryData<UserData>([UserQueryKey.Home], response.data);
      }

      // Показываем успешное уведомление
      console.log('showSuccess');
      showSuccess('profile');
    },
  });

  return { updateProfile: updateProfileMutation };
};
