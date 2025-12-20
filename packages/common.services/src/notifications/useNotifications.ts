/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSocketEvent } from 'common.sockets';
import { NotificationT, NotificationsStateT, RecipientNotificationResponse } from 'common.types';
import {
  generateNotificationTitle,
  generateNotificationDescription,
  getNotificationInvalidationKeys,
} from './notificationUtils';
import { useSearchNotifications } from './useSearchNotifications';
import { useGetUnreadCount } from './useGetUnreadCount';
import { useMarkNotificationAsRead } from './useMarkNotificationAsRead';
import { useCurrentUser } from '../user';

export const useNotifications = () => {
  const [socketNotifications, setSocketNotifications] = useState<NotificationT[]>([]);
  const [shouldLoadNotifications, setShouldLoadNotifications] = useState(false);
  const queryClient = useQueryClient();

  // Проверяем, авторизован ли пользователь
  const { data: currentUser, isError: isUserError } = useCurrentUser();
  const isAuthenticated = !!currentUser && !isUserError;

  // Проверяем, находимся ли мы на страницах внутри (app)
  // Используем window.location.pathname, так как NotificationsProvider находится вне RouterProvider
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isInApp = ![
    '/signin',
    '/signup',
    '/reset-password',
    '/welcome',
    '/invite',
    '/confirm-email',
  ].some((route) => pathname.startsWith(route));

  // API хуки - загружаем список уведомлений только когда shouldLoadNotifications = true
  // Счетчик непрочитанных загружается всегда при авторизации
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
    enabled: isAuthenticated && isInApp && shouldLoadNotifications,
  });

  const {
    data: unreadCount,
    isLoading: isLoadingCount,
    refetch: refetchCount,
  } = useGetUnreadCount({ enabled: isAuthenticated && isInApp });

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

      // Добавляем новое уведомление в начало списка socket-уведомлений (чтобы оно появилось вверху)
      setSocketNotifications((prev) => {
        // Проверяем, нет ли уже такого уведомления (по id)
        if (prev.some((n) => n.id === notification.id)) {
          return prev;
        }
        // Добавляем новое уведомление в начало массива, чтобы оно отображалось вверху
        return [notification, ...prev];
      });

      // Ревалидируем кеш связанных данных на основе конфига уведомления
      const invalidationKeys = getNotificationInvalidationKeys(notification);
      invalidationKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
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
    [refetchCount, transformNotification, queryClient],
  );

  // Обработчик для Socket.IO с проверкой авторизации и нахождения в (app)
  const handleSocketNotification = useCallback(
    (data: NotificationT | RecipientNotificationResponse) => {
      // Не обрабатываем события, если пользователь не авторизован или не находится в (app)
      if (!isAuthenticated || !isInApp) {
        return;
      }
      handleNewNotification(data);
    },
    [isAuthenticated, isInApp, handleNewNotification],
  );

  // Подписываемся на события SocketIO (новый формат события)
  // /=tmexio-SUB=/new-notification/ - это техническая особенность бэка, имя события просто "new-notification"
  // WebSocket может возвращать как обёрнутый формат (RecipientNotificationResponse), так и прямой (NotificationT)
  // Обработчик проверяет авторизацию перед обработкой события
  useSocketEvent<NotificationT | RecipientNotificationResponse>(
    'new-notification',
    handleSocketNotification,
    [isAuthenticated, isInApp],
  );

  // Обновляем счетчик непрочитанных при монтировании (только если пользователь авторизован и находится в (app))
  // Список уведомлений загружается только при открытии dropdown
  useEffect(() => {
    if (!isAuthenticated || !isInApp) {
      return;
    }
    // Обновляем счетчик при монтировании
    refetchCount();
  }, [refetchCount, isAuthenticated, isInApp]);

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
      // Находим уведомление для ревалидации кеша
      const notification = allNotifications.find((n) => n.id === id);

      // Оптимистично обновляем локальное состояние
      setSocketNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification,
        ),
      );

      try {
        await markAsReadMutation.mutateAsync(id);

        // Ревалидируем кеш связанных данных на основе конфига уведомления
        if (notification) {
          const invalidationKeys = getNotificationInvalidationKeys(notification);
          invalidationKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
          });
        }

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
    [markAsReadMutation, refetchCount, refetchNotifications, allNotifications, queryClient],
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
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Загрузить список уведомлений (вызывается при открытии dropdown)
  const loadNotifications = useCallback(() => {
    if (isAuthenticated && isInApp && !shouldLoadNotifications) {
      setShouldLoadNotifications(true);
    } else if (isAuthenticated && isInApp) {
      // Если уже загружали, просто обновляем данные
      refetchNotifications();
    }
  }, [isAuthenticated, isInApp, shouldLoadNotifications, refetchNotifications]);

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
    loadNotifications,
  };
};
