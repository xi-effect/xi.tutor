import { useQuery } from '@tanstack/react-query';
import { notificationsApiConfig, NotificationsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';

interface UseGetUnreadCountProps {
  limit?: number; // >0, ≤100, default 100
  enabled?: boolean;
}

/**
 * Хук для получения количества непрочитанных уведомлений
 * GET /api/protected/notification-service/users/current/unread-notifications-count/
 */
export const useGetUnreadCount = ({ limit, enabled = true }: UseGetUnreadCountProps = {}) => {
  const { data, isLoading, error, ...rest } = useQuery<number>({
    queryKey: [NotificationsQueryKey.GetUnreadCount, limit],
    queryFn: async () => {
      const axiosInst = await getAxiosInstance();

      const response = await axiosInst<number>({
        method: notificationsApiConfig[NotificationsQueryKey.GetUnreadCount].method,
        url: notificationsApiConfig[NotificationsQueryKey.GetUnreadCount].getUrl(),
        params: {
          limit: limit || 100,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    },
    enabled,
    refetchInterval: 600000, // Обновлять каждые 10 минут
  });

  return {
    data: data ?? 0,
    isLoading,
    error,
    ...rest,
  };
};
