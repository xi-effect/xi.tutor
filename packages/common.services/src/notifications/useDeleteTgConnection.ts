import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TelegramConnectionQueryKey, UserQueryKey, telegramConnectionApiConfig } from 'common.api';

export const useDeleteTgConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: telegramConnectionApiConfig[TelegramConnectionQueryKey.RemoveConnection].method,
          url: telegramConnectionApiConfig[TelegramConnectionQueryKey.RemoveConnection].getUrl(),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data;
      } catch (err) {
        console.error('Ошибка при отключении уведомлений от Telegram:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    },
  });
};
