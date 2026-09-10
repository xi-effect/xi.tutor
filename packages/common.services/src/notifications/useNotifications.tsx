/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@xipkg/button';
import { useSocketEvent } from 'common.sockets';
import { NotificationT, NotificationsStateT, RecipientNotificationResponse } from 'common.types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCurrentUser } from '../user';
import { notificationConfigs } from './notificationConfig';
import {
  generateNotificationAction,
  generateNotificationDescription,
  generateNotificationTitle,
  getNotificationInvalidationKeys,
} from './notificationUtils';
import { navigateFromNotification } from './notificationNavigation';
import { playIncomingNotificationSound } from './notificationSound';
import { shouldUseSystemNotifications, showSystemNotification } from './webNotifications';
import { useGetUnreadCount } from './useGetUnreadCount';
import { useMarkNotificationAsRead } from './useMarkNotificationAsRead';
import { useSearchNotifications } from './useSearchNotifications';
// import { NotificationsQueryKey } from '../../../common.api/src/notifications';

// Очередь отметки уведомлений прочитанными, копим id и шлём пачками с паузой между ними
const READ_QUEUE_BATCH_SIZE = 5;
const READ_QUEUE_INITIAL_DELAY_MS = 200;
const READ_QUEUE_BATCH_INTERVAL_MS = 900; // пауза между последующими пачками

export const useNotifications = () => {
  const [socketNotifications, setSocketNotifications] = useState<NotificationT[]>([]);
  const [shouldLoadNotifications, setShouldLoadNotifications] = useState(false);
  const queryClient = useQueryClient();
  const pendingReadIdsRef = useRef<Set<string>>(new Set());
  const readQueueRequestInFlightRef = useRef(false);
  const readQueueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Проверяем, находимся ли мы на страницах внутри (app)
  // Используем window.location.pathname, так как NotificationsProvider находится вне RouterProvider
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isAuthPage = ['/signin', '/signup', '/reset-password'].some((route) =>
    pathname.startsWith(route),
  );
  const isInApp = ![
    '/signin',
    '/signup',
    '/reset-password',
    '/welcome',
    '/invite',
    '/confirm-email',
  ].some((route) => pathname.startsWith(route));

  const { data: currentUser, isError: isUserError } = useCurrentUser(isAuthPage);
  const isAuthenticated = !!currentUser && !isUserError;

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

  const { markAsRead: markAsReadMutation } = useMarkNotificationAsRead({
    skipCacheInvalidation: true,
  });

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

  const onNavigate = useCallback((url: string) => {
    try {
      navigateFromNotification(url);
    } catch (error) {
      console.error('Ошибка при навигации:', error);
    }
  }, []);

  // Обработчик нового уведомления от SocketIO
  const handleNewNotification = useCallback(
    (data: NotificationT | RecipientNotificationResponse) => {
      const notification = transformNotification(data);

      // Добавляем новое уведомление в начало списка socket-уведомлений (чтобы оно появилось вверху)
      let isNewNotification = false;
      setSocketNotifications((prev) => {
        // Проверяем, нет ли уже такого уведомления (по id)
        if (prev.some((n) => n.id === notification.id)) {
          return prev;
        }
        isNewNotification = true;
        // Добавляем новое уведомление в начало массива, чтобы оно отображалось вверху
        return [notification, ...prev];
      });

      if (isNewNotification) {
        playIncomingNotificationSound();
      }

      // Ревалидируем кеш связанных данных на основе конфига уведомления
      const invalidationKeys = getNotificationInvalidationKeys(notification);
      invalidationKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? [...key] : [key] });
      });

      // Обновляем счетчик непрочитанных с сервера (синхронизация)
      refetchCount();

      // Показываем toast уведомление
      const title = generateNotificationTitle(notification);
      const description = generateNotificationDescription(notification);

      const { kind } = notification.payload;
      const config = notificationConfigs[kind];

      if (config?.onNotify) {
        const keys = config.onNotify(notification.payload);
        if (keys?.length) {
          keys.forEach((key) => {
            queryClient.invalidateQueries({
              queryKey: Array.isArray(key) ? [...key] : [key],
              // Расписание часто не на экране — принудительно обновляем кеш в фоне
              refetchType: 'all',
            });
          });
        }
      }

      const url = config ? generateNotificationAction(notification) : null;

      if (shouldUseSystemNotifications()) {
        showSystemNotification({
          title,
          body: description,
          url: url ?? undefined,
          onNavigate: url ? onNavigate : undefined,
        });
      } else {
        const toastId = toast(title, {
          description,
          duration: 5000,
          action: config && url && (
            <div className="flex flex-1 justify-end">
              <Button
                size="s"
                onClick={(e) => {
                  e.stopPropagation();
                  if (url) {
                    onNavigate(url);
                    toast.dismiss(toastId);
                  }
                }}
              >
                Перейти
              </Button>
            </div>
          ),
        });
      }
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

  // Отправляет одну пачку из очереди и планирует следующую, если в очереди остались элементы
  const flushReadQueue = useCallback(() => {
    readQueueTimerRef.current = null;

    if (pendingReadIdsRef.current.size === 0 || readQueueRequestInFlightRef.current) {
      return;
    }

    readQueueRequestInFlightRef.current = true;

    const batchIds = Array.from(pendingReadIdsRef.current).slice(0, READ_QUEUE_BATCH_SIZE);
    batchIds.forEach((id) => pendingReadIdsRef.current.delete(id));
    const succeededIds: string[] = [];

    Promise.allSettled(
      batchIds.map(async (id) => {
        try {
          await markAsReadMutation.mutateAsync(id);
          succeededIds.push(id);
        } catch (error) {
          pendingReadIdsRef.current.delete(id);
          setSocketNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)),
          );
          console.error(`Ошибка при отметке уведомления ${id} как прочитанного:`, error);
        }
      }),
    ).finally(() => {
      readQueueRequestInFlightRef.current = false;
      if (succeededIds.length > 0) {
        refetchCount();
        refetchNotifications(); // один реальный рефетч списка на всю пачку
      }

      if (pendingReadIdsRef.current.size > 0) {
        readQueueTimerRef.current = setTimeout(flushReadQueue, READ_QUEUE_BATCH_INTERVAL_MS);
      }
    });
  }, [markAsReadMutation, refetchCount, refetchNotifications]);

  // Кладёт id в очередь и запускает таймер отправки, если он ещё не запущен
  const enqueueMarkAsRead = useCallback(
    (id: string) => {
      if (pendingReadIdsRef.current.has(id)) return;
      pendingReadIdsRef.current.add(id);
      if (!readQueueTimerRef.current && !readQueueRequestInFlightRef.current) {
        readQueueTimerRef.current = setTimeout(flushReadQueue, READ_QUEUE_INITIAL_DELAY_MS);
      }
    },
    [flushReadQueue],
  );

  // Останавливаем очередь при размонтировании провайдера
  useEffect(() => {
    return () => {
      if (readQueueTimerRef.current) {
        clearTimeout(readQueueTimerRef.current);
      }
    };
  }, []);

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

      enqueueMarkAsRead(id);
    },
    [enqueueMarkAsRead],
  );

  // Отметить все уведомления как прочитанные (локально, API для этого еще нет)
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = allNotifications.filter((n) => !n.is_read);
    if (unreadNotifications.length === 0) return;

    const unreadIds = new Set(unreadNotifications.map((n) => n.id));

    // Оптимистично помечаем всё видимое прочитанным разом
    setSocketNotifications((prev) =>
      prev.map((notification) =>
        unreadIds.has(notification.id) ? { ...notification, is_read: true } : notification,
      ),
    );

    unreadNotifications.forEach((n) => enqueueMarkAsRead(n.id));
  }, [allNotifications, enqueueMarkAsRead]);

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
