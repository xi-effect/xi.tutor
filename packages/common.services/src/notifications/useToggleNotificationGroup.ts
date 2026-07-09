import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { NotificationsQueryKey, notificationsApiConfig } from 'common.api';
import { DeliveryMethodKind, NotificationGroupKind } from 'common.types';

type ToggleNotificationGroupVariables = {
  deliveryMethodKind: DeliveryMethodKind;
  notificationGroupKind: NotificationGroupKind;
  enabled: boolean;
};

export const useToggleNotificationGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      deliveryMethodKind,
      notificationGroupKind,
      enabled,
    }: ToggleNotificationGroupVariables) => {
      const axiosInst = await getAxiosInstance();
      const apiConfig = enabled
        ? notificationsApiConfig.EnableNotificationGroup
        : notificationsApiConfig.DisableNotificationGroup;

      await axiosInst({
        method: apiConfig.method,
        url: apiConfig.getUrl(deliveryMethodKind, notificationGroupKind),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NotificationsQueryKey.DeliveryMethods] });
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 422) {
        toast.error('Не удалось изменить настройки уведомлений');
        return;
      }

      console.error('Ошибка при изменении группы уведомлений:', error);
    },
  });
};
