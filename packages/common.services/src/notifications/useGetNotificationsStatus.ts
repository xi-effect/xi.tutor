import { notificationsApiConfig, NotificationsQueryKey } from 'common.api';
import { NotificationsSettingsT } from 'common.types';
import { useFetching } from 'common.config';

export const useGetNotificationsStatus = () => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: notificationsApiConfig[NotificationsQueryKey.NotificationsSettings].method,
      getUrl: () => notificationsApiConfig[NotificationsQueryKey.NotificationsSettings].getUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    queryKey: [NotificationsQueryKey.NotificationsSettings],
  });

  return {
    data: data as NotificationsSettingsT,
    isError,
    isLoading,
    ...rest,
  };
};
