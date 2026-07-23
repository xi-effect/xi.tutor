import { notificationsApiConfig, NotificationsQueryKey } from 'common.api';
import { DeliveryMethodsResponse } from 'common.types';
import { useFetching } from 'common.config';

export const useGetDeliveryMethods = () => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: notificationsApiConfig[NotificationsQueryKey.DeliveryMethods].method,
      getUrl: () => notificationsApiConfig[NotificationsQueryKey.DeliveryMethods].getUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    queryKey: [NotificationsQueryKey.DeliveryMethods],
  });

  return {
    data: data as DeliveryMethodsResponse | undefined,
    isError,
    isLoading,
    ...rest,
  };
};

/** @deprecated Используйте useGetDeliveryMethods */
export const useGetNotificationsStatus = useGetDeliveryMethods;
