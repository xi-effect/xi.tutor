import { userApiConfig, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { UserData, ProfileData, RoleT } from 'common.types';
import { handleError, showSuccess } from 'common.services';

interface MutationContext {
  previousUser?: UserData;
  profileData?: ProfileData;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation<
    AxiosResponse<UserData>,
    Error,
    ProfileData,
    MutationContext
  >({
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

      // Возвращаем предыдущее значение для отката в случае ошибки и сохраняем profileData
      return { previousUser, profileData };
    },
    onError: (err, _profileData, context) => {
      // В случае ошибки откатываем изменения
      if (context?.previousUser) {
        queryClient.setQueryData([UserQueryKey.Home], context.previousUser);
      }

      // Показываем toast с ошибкой
      handleError(err, 'profile');
    },
    onSuccess: (response, _profileData, context) => {
      // Если сервер вернул обновленные данные, обновляем кеш
      if (response?.data) {
        queryClient.setQueryData<UserData>([UserQueryKey.Home], response.data);
      }

      // Проверяем, обновляется ли только default_layout
      const isOnlyRoleChange =
        context?.profileData &&
        Object.keys(context.profileData).length === 1 &&
        'default_layout' in context.profileData;

      if (isOnlyRoleChange && context.profileData) {
        // Показываем конкретное уведомление для смены роли
        const role = context.profileData.default_layout as RoleT;
        const roleText = role === 'tutor' ? 'Репетитор' : 'Ученик';
        toast.success(`Роль успешно изменена на ${roleText}`);
      } else {
        // Показываем стандартное уведомление для других изменений профиля
        showSuccess('profile');
      }
    },
  });

  return { updateProfile: updateProfileMutation };
};
