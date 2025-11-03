import { useInfiniteQuery } from '@tanstack/react-query';
import { notificationsApiConfig, NotificationsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import type {
  NotificationT,
  NotificationsSearchResponse,
  RecipientNotificationResponse,
} from 'common.types';

interface UseSearchNotificationsProps {
  limit?: number; // 0 < limit < 100, default 12
  enabled?: boolean;
}

/**
 * Трансформирует ответ API из формата RecipientNotificationResponse в NotificationT
 */
const transformNotificationResponse = (response: RecipientNotificationResponse): NotificationT => {
  const { read_at, notification } = response;
  return {
    id: notification.id,
    actor_user_id: notification.actor_user_id ?? null,
    is_read: read_at !== null,
    payload: notification.payload as NotificationT['payload'],
    created_at: notification.created_at,
    updated_at: notification.updated_at || notification.created_at,
  };
};

/**
 * Хук для поиска уведомлений с пагинацией (cursor-based)
 * POST /api/protected/notification-service/users/current/notifications/searches/
 * Использует useInfiniteQuery для автоматической пагинации
 */
export const useSearchNotifications = ({
  limit = 12,
  enabled = true,
}: UseSearchNotificationsProps = {}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    ...rest
  } = useInfiniteQuery<NotificationT[]>({
    queryKey: [NotificationsQueryKey.SearchNotifications, limit],
    // pageParam - это значение, которое возвращает getNextPageParam из предыдущей страницы
    // При первой загрузке pageParam = undefined (initialPageParam)
    queryFn: async ({ pageParam }) => {
      const axiosInst = await getAxiosInstance();

      const response = await axiosInst<NotificationsSearchResponse>({
        method: notificationsApiConfig[NotificationsQueryKey.SearchNotifications].method,
        url: notificationsApiConfig[NotificationsQueryKey.SearchNotifications].getUrl(),
        data: {
          cursor: pageParam
            ? {
                created_at: pageParam,
              }
            : null,
          limit,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Трансформируем данные из формата API в наш формат
      return response.data.map(transformNotificationResponse);
    },
    // Начальное значение для первой страницы
    initialPageParam: undefined as string | undefined,
    // Эта функция определяет cursor для следующей страницы
    // Возвращаемое значение станет pageParam для следующего запроса
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) {
        return undefined; // Больше страниц нет
      }

      // Используем created_at последнего уведомления как cursor для следующей страницы
      const lastNotification = lastPage[lastPage.length - 1];
      if (!lastNotification?.created_at) {
        return undefined;
      }

      // Если вернулось меньше запрошенного количества, значит больше нет
      if (lastPage.length < limit) {
        return undefined;
      }

      // Возвращаем created_at последнего элемента - это будет pageParam для следующего запроса
      return lastNotification.created_at;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });

  // Объединяем все страницы в один массив (по аналогии с useInfiniteQuery из materials)
  const notifications: NotificationT[] =
    data?.pages.flatMap((page) => (Array.isArray(page) ? page : [])) || [];

  return {
    notifications,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    refetch,
    ...rest,
  };
};
