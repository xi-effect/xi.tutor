/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useSocketEvent, useSocketEmit } from 'common.sockets';
import { NotificationT, NotificationsStateT } from 'common.types';
import { generateNotificationTitle, generateNotificationDescription } from './notificationUtils';

// Моковые данные для тестирования (новый формат)
const mockNotifications: NotificationT[] = [
  {
    id: '1',
    actor_user_id: 1,
    is_read: false,
    payload: {
      kind: 'classroom_material_created',
      classroom_id: 45,
      material_id: 1234,
    },
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    actor_user_id: null,
    is_read: false,
    payload: {
      kind: 'classroom_lesson_scheduled',
      classroom_id: 45,
      scheduled_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    actor_user_id: 2,
    is_read: true,
    payload: {
      kind: 'payment_success',
      amount: 5000,
      currency: 'RUB',
    },
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

export const useNotifications = () => {
  const [state, setState] = useState<NotificationsStateT>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    hasMore: true,
    nextCursor: undefined,
  });

  const emitNotification = useSocketEmit<{ id: string }>('notification:read');
  const emitReadAll = useSocketEmit<void>('notification:read_all');
  const emitDelete = useSocketEmit<{ id: string }>('notification:delete');
  const emitTest = useSocketEmit<NotificationT>('notification:test');

  // HTTP API функции
  const fetchNotifications = useCallback(async (cursor?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // TODO: Заменить на реальный API вызов
      // const response = await fetch(notificationsApiConfig[NotificationsQueryKey.GetNotifications].getUrl(cursor));
      // const data: NotificationsListResponse = await response.json();

      // Пока используем моковые данные
      const data = {
        notifications: mockNotifications,
        has_more: false,
        next_cursor: undefined,
      };

      setState((prev) => ({
        ...prev,
        notifications: cursor ? [...prev.notifications, ...data.notifications] : data.notifications,
        hasMore: data.has_more,
        nextCursor: data.next_cursor,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Ошибка загрузки уведомлений',
        isLoading: false,
      }));
    }
  }, []);

  const fetchNotificationCount = useCallback(async () => {
    try {
      // TODO: Заменить на реальный API вызов
      // const response = await fetch(notificationsApiConfig[NotificationsQueryKey.GetNotificationCount].getUrl());
      // const data: NotificationCountResponse = await response.json();

      // Пока используем моковые данные
      const unreadCount = mockNotifications.filter((n) => !n.is_read).length;

      setState((prev) => ({
        ...prev,
        unreadCount,
      }));
    } catch (error) {
      console.error('Ошибка загрузки счетчика уведомлений:', error);
    }
  }, []);

  // Обработчик нового уведомления от SocketIO
  const handleNewNotification = useCallback((notification: NotificationT) => {
    console.log('📨 Получено новое уведомление:', notification);

    setState((prev) => {
      const newNotifications = [notification, ...prev.notifications];
      const newUnreadCount = newNotifications.filter((n) => !n.is_read).length;

      // Показываем toast уведомление
      const title = generateNotificationTitle(notification);
      const description = generateNotificationDescription(notification);

      toast(title, {
        description,
        duration: 5000,
      });

      console.log('✅ Уведомление добавлено в состояние, новый счетчик:', newUnreadCount);

      return {
        ...prev,
        notifications: newNotifications,
        unreadCount: newUnreadCount,
      };
    });
  }, []);

  // Обработчик тестового уведомления
  const handleTestNotification = useCallback(
    (notification: NotificationT) => {
      console.log('🧪 Получено тестовое уведомление через сокет:', notification);
      handleNewNotification(notification);
    },
    [handleNewNotification],
  );

  // Подписываемся на события SocketIO
  useSocketEvent<NotificationT>('create-notification', handleNewNotification);
  useSocketEvent<NotificationT>('notification:test', handleTestNotification);

  // Загружаем уведомления при инициализации
  useEffect(() => {
    fetchNotifications();
    fetchNotificationCount();
  }, [fetchNotifications, fetchNotificationCount]);

  // Отметить уведомление как прочитанное
  const markAsRead = useCallback(
    async (id: string) => {
      setState((prev) => {
        const updatedNotifications = prev.notifications.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification,
        );
        const newUnreadCount = updatedNotifications.filter((n) => !n.is_read).length;

        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount: newUnreadCount,
        };
      });

      try {
        // TODO: Заменить на реальный API вызов
        // await fetch(notificationsApiConfig[NotificationsQueryKey.MarkAsRead].getUrl(id), {
        //   method: 'POST',
        // });

        // Отправляем событие на сервер через SocketIO
        emitNotification({ id });
      } catch (error) {
        console.error('Ошибка при отметке уведомления как прочитанного:', error);
      }
    },
    [emitNotification],
  );

  // Отметить все уведомления как прочитанные
  const markAllAsRead = useCallback(async () => {
    setState((prev) => {
      const updatedNotifications = prev.notifications.map((notification) => ({
        ...notification,
        is_read: true,
      }));

      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount: 0,
      };
    });

    try {
      // TODO: Заменить на реальный API вызов
      // await fetch(notificationsApiConfig[NotificationsQueryKey.MarkAllAsRead].getUrl(), {
      //   method: 'POST',
      // });

      // Отправляем событие на сервер через SocketIO
      emitReadAll();
    } catch (error) {
      console.error('Ошибка при отметке всех уведомлений как прочитанных:', error);
    }
  }, [emitReadAll]);

  // Удалить уведомление
  const deleteNotification = useCallback(
    async (id: string) => {
      setState((prev) => {
        const updatedNotifications = prev.notifications.filter((n) => n.id !== id);
        const newUnreadCount = updatedNotifications.filter((n) => !n.is_read).length;

        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount: newUnreadCount,
        };
      });

      try {
        // TODO: Заменить на реальный API вызов
        // await fetch(notificationsApiConfig[NotificationsQueryKey.DeleteNotification].getUrl(id), {
        //   method: 'DELETE',
        // });

        // Отправляем событие на сервер через SocketIO
        emitDelete({ id });
      } catch (error) {
        console.error('Ошибка при удалении уведомления:', error);
      }
    },
    [emitDelete],
  );

  // Отправить тестовое уведомление
  const sendTestNotification = useCallback(() => {
    console.log('🔔 Отправка тестового уведомления...');

    const testNotification: NotificationT = {
      id: `test-${Date.now()}`,
      actor_user_id: null,
      is_read: false,
      payload: {
        kind: 'general',
        message: 'Это тестовое уведомление для проверки функциональности',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('📤 Отправляем событие notification:test:', testNotification);
    emitTest(testNotification);

    // Также добавляем уведомление локально для тестирования
    handleNewNotification(testNotification);
  }, [emitTest, handleNewNotification]);

  // Загрузить больше уведомлений (пагинация)
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.isLoading && state.nextCursor) {
      fetchNotifications(state.nextCursor);
    }
  }, [state.hasMore, state.isLoading, state.nextCursor, fetchNotifications]);

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestNotification,
    loadMore,
    refreshNotifications: () => fetchNotifications(),
    refreshCount: fetchNotificationCount,
  };
};
