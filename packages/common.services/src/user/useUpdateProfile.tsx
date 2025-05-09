import { userApiConfig, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Определяем тип для данных профиля, которые можно обновить
export type ProfileData = {
  username?: string;
  display_name?: string;
  theme?: string;
  // Другие поля профиля, которые могут быть обновлены
};

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
    onSuccess: () => {
      // Инвалидируем кеш текущего пользователя, чтобы обновить данные
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    },
  });

  return { updateProfile: updateProfileMutation };
};
