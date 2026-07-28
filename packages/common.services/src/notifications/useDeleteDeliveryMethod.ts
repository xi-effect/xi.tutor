import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationsQueryKey, UserQueryKey, notificationsApiConfig } from 'common.api';
import { DeliveryMethodKind } from 'common.types';

type DeletableDeliveryMethodKind = Extract<DeliveryMethodKind, 'telegram' | 'vk'>;

export const useDeleteDeliveryMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deliveryMethodKind: DeletableDeliveryMethodKind) => {
      const axiosInst = await getAxiosInstance();
      const response = await axiosInst({
        method: notificationsApiConfig.DeleteDeliveryMethod.method,
        url: notificationsApiConfig.DeleteDeliveryMethod.getUrl(deliveryMethodKind),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NotificationsQueryKey.DeliveryMethods] });
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    },
    onError: (error) => {
      console.error('Ошибка при отключении способа доставки:', error);
    },
  });
};
