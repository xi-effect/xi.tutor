import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApiConfig, NotificationsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError } from '..';

type UseMarkNotificationAsReadOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

/**
 * Хук для отметки уведомления как прочитанного
 * POST /api/protected/notification-service/users/current/notifications/{notification_id}/read/
 */
export const useMarkNotificationAsRead = (options?: UseMarkNotificationAsReadOptions) => {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation<void, Error, string>({
    mutationFn: async (notificationId: string) => {
      try {
        const axiosInst = await getAxiosInstance();

        await axiosInst({
          method: notificationsApiConfig[NotificationsQueryKey.MarkAsRead].method,
          url: notificationsApiConfig[NotificationsQueryKey.MarkAsRead].getUrl(notificationId),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // 204 No Content - успешно
      } catch (err) {
        console.error('Ошибка при отметке уведомления как прочитанного:', err);
        throw err;
      }
    },
    onSuccess: () => {
      // Инвалидируем запросы для обновления списка и счетчика
      queryClient.invalidateQueries({
        queryKey: [NotificationsQueryKey.SearchNotifications],
      });
      queryClient.invalidateQueries({
        queryKey: [NotificationsQueryKey.GetUnreadCount],
      });
      // Вызываем пользовательский колбэк, если он передан
      options?.onSuccess?.();
    },
    onError: (err) => {
      handleError(err, 'notifications');
      // Вызываем пользовательский колбэк, если он передан
      options?.onError?.(err);
    },
  });

  return { markAsRead: markAsReadMutation };
};
