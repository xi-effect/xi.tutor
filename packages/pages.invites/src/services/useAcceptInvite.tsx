import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassroomResponseT } from '../types';
import { useNavigate } from '@tanstack/react-router';
import { ClassroomsQueryKey, studentApiConfig, StudentQueryKey, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError, useCurrentUser, useUpdateProfile } from 'common.services';

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  return useMutation<ClassroomResponseT, Error, string>({
    mutationFn: async (code: string) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: studentApiConfig[StudentQueryKey.UseInvitation].method,
          url: studentApiConfig[StudentQueryKey.UseInvitation].getUrl(code),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response.data as ClassroomResponseT;
      } catch (err) {
        console.error('Ошибка:', err);
        throw err;
      }
    },
    onSuccess: (classroomData) => {
      queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.GetClassrooms] });

      // Проверяем роль пользователя из кеша (на случай, если currentUser еще не обновился)
      const user = queryClient.getQueryData<typeof currentUser>([UserQueryKey.Home]) || currentUser;

      // Если пользователь имеет роль tutor, принудительно обновляем на student
      if (user?.default_layout === 'tutor') {
        updateProfile.mutate(
          { default_layout: 'student' },
          {
            onSuccess: () => {
              navigate({ to: `/classrooms/${classroomData.id}` });
            },
            onError: (error) => {
              console.error('Ошибка при обновлении роли:', error);
              // Все равно переходим на страницу класса, даже если обновление роли не удалось
              navigate({ to: `/classrooms/${classroomData.id}` });
            },
          },
        );
      } else {
        navigate({ to: `/classrooms/${classroomData.id}` });
      }
    },
    onError: (error) => {
      console.error('Ошибка:', error.message);
      handleError(error, 'acceptInvite');
    },
  });
};
