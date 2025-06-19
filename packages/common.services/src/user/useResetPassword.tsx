import { userApiConfig, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    },
  });

  return { resetPasswordConfirm: resetPasswordMutation };
};
