/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useSocketEvent, useSocketEmit } from 'common.sockets';
import { NotificationT, NotificationsStateT } from 'common.types';

// Моковые данные для тестирования
const mockNotifications: NotificationT[] = [
  {
    id: '1',
    type: 'message',
    title: 'Новое сообщение в чате',
    description: 'Анна Петрова отправила вам сообщение',
    date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: '2',
    type: 'lesson_reminder',
    title: 'Напоминание о занятии',
    description: 'Через 30 минут начинается урок математики',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: '3',
    type: 'new_material',
    title: 'Новый материал доступен',
    description: 'Загружен новый учебный материал по физике',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: '4',
    type: 'payment_success',
    title: 'Оплата прошла успешно',
    description: 'Ваш платеж на сумму 5000 ₽ обработан',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: '5',
    type: 'group_invitation',
    title: 'Приглашение в группу',
    description: 'Вас пригласили в группу "Продвинутая математика"',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
];

export const useNotifications = () => {
  const initialUnreadCount = mockNotifications.filter((n) => !n.isRead).length;

  const [state, setState] = useState<NotificationsStateT>({
    notifications: mockNotifications,
    unreadCount: initialUnreadCount,
    isLoading: false,
    error: null,
  });

  const emitNotification = useSocketEmit<{ id: string }>('notification:read');
  const emitReadAll = useSocketEmit<void>('notification:read_all');
  const emitDelete = useSocketEmit<{ id: string }>('notification:delete');
  const emitTest = useSocketEmit<NotificationT>('notification:test');

  // Обработчик нового уведомления
  const handleNewNotification = useCallback((notification: NotificationT) => {
    console.log('📨 Получено новое уведомление:', notification);

    setState((prev) => {
      const newNotifications = [notification, ...prev.notifications];
      const newUnreadCount = newNotifications.filter((n) => !n.isRead).length;

      // Показываем toast уведомление
      toast(notification.title, {
        description: notification.description,
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
  useSocketEvent<NotificationT>('notification:new', handleNewNotification);
  useSocketEvent<NotificationT>('notification:test', handleTestNotification);

  // Отметить уведомление как прочитанное
  const markAsRead = useCallback(
    (id: string) => {
      setState((prev) => {
        const updatedNotifications = prev.notifications.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification,
        );
        const newUnreadCount = updatedNotifications.filter((n) => !n.isRead).length;

        // Отправляем событие на сервер
        emitNotification({ id });

        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount: newUnreadCount,
        };
      });
    },
    [emitNotification],
  );

  // Отметить все уведомления как прочитанные
  const markAllAsRead = useCallback(() => {
    setState((prev) => {
      const updatedNotifications = prev.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));

      // Отправляем событие на сервер
      emitReadAll();

      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount: 0,
      };
    });
  }, [emitReadAll]);

  // Удалить уведомление
  const deleteNotification = useCallback(
    (id: string) => {
      setState((prev) => {
        const updatedNotifications = prev.notifications.filter((n) => n.id !== id);
        const newUnreadCount = updatedNotifications.filter((n) => !n.isRead).length;

        // Отправляем событие на сервер
        emitDelete({ id });

        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount: newUnreadCount,
        };
      });
    },
    [emitDelete],
  );

  // Отправить тестовое уведомление
  const sendTestNotification = useCallback(() => {
    console.log('🔔 Отправка тестового уведомления...');

    const testNotification: NotificationT = {
      id: `test-${Date.now()}`,
      type: 'general',
      title: 'Тестовое уведомление',
      description: 'Это тестовое уведомление для проверки функциональности',
      date: new Date().toISOString(),
      isRead: false,
    };

    console.log('📤 Отправляем событие notification:test:', testNotification);
    emitTest(testNotification);

    // Также добавляем уведомление локально для тестирования
    handleNewNotification(testNotification);
  }, [emitTest, handleNewNotification]);

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestNotification,
  };
};
