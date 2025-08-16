import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TelegramConnectionQueryKey, UserQueryKey, telegramConnectionApiConfig } from 'common.api';

export const useCreateTgConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: telegramConnectionApiConfig[TelegramConnectionQueryKey.CreateConnection].method,
          url: telegramConnectionApiConfig[TelegramConnectionQueryKey.CreateConnection].getUrl(),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.data;
      } catch (err) {
        console.error('Ошибка при подключении к Telegram:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    },
  });
};
