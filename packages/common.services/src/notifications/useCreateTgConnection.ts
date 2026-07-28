import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { NotificationsQueryKey, UserQueryKey, notificationsApiConfig } from 'common.api';

export const useCreateTgConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const axiosInst = await getAxiosInstance();
      const response = await axiosInst({
        method: notificationsApiConfig.CreateTgConnection.method,
        url: notificationsApiConfig.CreateTgConnection.getUrl(),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NotificationsQueryKey.DeliveryMethods] });
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: [NotificationsQueryKey.DeliveryMethods] });
        toast.error('Telegram уже подключён');
        return;
      }

      console.error('Ошибка при подключении к Telegram:', error);
    },
  });
};
