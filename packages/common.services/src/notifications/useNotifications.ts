/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useSocketEvent } from 'common.sockets';
import { NotificationT, NotificationsStateT, RecipientNotificationResponse } from 'common.types';
import { generateNotificationTitle, generateNotificationDescription } from './notificationUtils';
import { useSearchNotifications } from './useSearchNotifications';
import { useGetUnreadCount } from './useGetUnreadCount';
import { useMarkNotificationAsRead } from './useMarkNotificationAsRead';

export const useNotifications = () => {
  const [socketNotifications, setSocketNotifications] = useState<NotificationT[]>([]);

  // API хуки
  const {
    notifications: apiNotifications,
    isLoading: isLoadingNotifications,
    error: searchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchNotifications,
  } = useSearchNotifications({
    limit: 12,
    enabled: true,
  });

  const {
    data: unreadCount,
    isLoading: isLoadingCount,
    refetch: refetchCount,
  } = useGetUnreadCount({});

  const { markAsRead: markAsReadMutation } = useMarkNotificationAsRead();

  // Трансформирует уведомление из формата API (если нужно) в наш формат
  const transformNotification = useCallback(
    (data: NotificationT | RecipientNotificationResponse): NotificationT => {
      // Проверяем, является ли это обёрнутым форматом
      if ('read_at' in data && 'notification' in data) {
        const { read_at, notification } = data as RecipientNotificationResponse;
        return {
          id: notification.id,
          actor_user_id: notification.actor_user_id ?? null,
          is_read: read_at !== null,
          payload: notification.payload as NotificationT['payload'],
          created_at: notification.created_at,
          updated_at: notification.updated_at || notification.created_at,
        };
      }
      // Уже в правильном формате
      return data as NotificationT;
    },
    [],
  );

  // Обработчик нового уведомления от SocketIO
  const handleNewNotification = useCallback(
    (data: NotificationT | RecipientNotificationResponse) => {
      const notification = transformNotification(data);

      // Добавляем новое уведомление в список socket-уведомлений
      setSocketNotifications((prev) => {
        // Проверяем, нет ли уже такого уведомления (по id)
        if (prev.some((n) => n.id === notification.id)) {
          return prev;
        }
        return [notification, ...prev];
      });

      // Обновляем счетчик непрочитанных с сервера (синхронизация)
      refetchCount();

      // Показываем toast уведомление
      const title = generateNotificationTitle(notification);
      const description = generateNotificationDescription(notification);

      toast(title, {
        description,
        duration: 5000,
      });
    },
    [refetchCount, transformNotification],
  );

  // Подписываемся на события SocketIO (новый формат события)
  // /=tmexio-SUB=/new-notification/ - это техническая особенность бэка, имя события просто "new-notification"
  // WebSocket может возвращать как обёрнутый формат (RecipientNotificationResponse), так и прямой (NotificationT)
  useSocketEvent<NotificationT | RecipientNotificationResponse>(
    'new-notification',
    handleNewNotification,
  );

  // Загружаем уведомления при инициализации
  useEffect(() => {
    // Первая загрузка происходит автоматически через useSearchNotifications
    // Обновляем счетчик при монтировании
    refetchCount();
  }, [refetchCount]);

  // Объединяем уведомления из API и Socket.IO
  // Socket-уведомления идут первыми, затем API-уведомления (убираем дубликаты)
  const allNotifications = useMemo(() => {
    const apiIds = new Set(apiNotifications.map((n) => n.id));
    const uniqueSocketNotifications = socketNotifications.filter((n) => !apiIds.has(n.id));
    return [...uniqueSocketNotifications, ...apiNotifications];
  }, [apiNotifications, socketNotifications]);

  // Загрузить начальные уведомления (обновление списка)
  const loadInitialNotifications = useCallback(() => {
    setSocketNotifications([]);
    refetchNotifications();
  }, [refetchNotifications]);

  // Отметить уведомление как прочитанное
  const markAsRead = useCallback(
    async (id: string) => {
      // Оптимистично обновляем локальное состояние
      setSocketNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification,
        ),
      );

      try {
        await markAsReadMutation.mutateAsync(id);
        // Обновляем счетчик и список после успешной отметки
        refetchCount();
        refetchNotifications();
      } catch (error) {
        // Откатываем оптимистичное обновление при ошибке
        setSocketNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id ? { ...notification, is_read: false } : notification,
          ),
        );
        console.error('Ошибка при отметке уведомления как прочитанного:', error);
      }
    },
    [markAsReadMutation, refetchCount, refetchNotifications],
  );

  // Отметить все уведомления как прочитанные (локально, API для этого нет)
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = allNotifications.filter((n) => !n.is_read);

    // Помечаем все непрочитанные уведомления как прочитанные
    for (const notification of unreadNotifications) {
      try {
        await markAsReadMutation.mutateAsync(notification.id);
      } catch (error) {
        console.error(`Ошибка при отметке уведомления ${notification.id}:`, error);
      }
    }

    // Обновляем счетчик и список
    refetchCount();
    refetchNotifications();
  }, [allNotifications, markAsReadMutation, refetchCount, refetchNotifications]);

  // Удалить уведомление (локально, API для этого нет в новом контракте)
  const deleteNotification = useCallback(
    async (id: string) => {
      setSocketNotifications((prev) => prev.filter((n) => n.id !== id));
      // Обновляем счетчик после удаления
      refetchCount();
    },
    [refetchCount],
  );

  // Загрузить больше уведомлений (пагинация)
  const loadMore = useCallback(() => {
    console.log('🔄 loadMore вызван', {
      isFetchingNextPage,
      hasNextPage,
      apiNotificationsCount: apiNotifications.length,
    });
    if (!isFetchingNextPage && hasNextPage) {
      console.log('✅ Вызываем fetchNextPage');
      fetchNextPage();
    } else {
      console.log('❌ Не вызываем fetchNextPage:', {
        isFetchingNextPage,
        hasNextPage,
      });
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage, apiNotifications.length]);

  const state: NotificationsStateT = {
    notifications: allNotifications,
    unreadCount: unreadCount ?? 0,
    isLoading: isLoadingNotifications || isLoadingCount,
    error: searchError
      ? searchError instanceof Error
        ? searchError.message
        : 'Ошибка загрузки уведомлений'
      : null,
    hasMore: hasNextPage ?? false,
    nextCursor: undefined, // Больше не используем nextCursor, так как используем hasNextPage из useInfiniteQuery
  };

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    isFetchingNextPage,
    refreshNotifications: loadInitialNotifications,
    refreshCount: refetchCount,
  };
};
