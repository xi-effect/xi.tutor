/* eslint-disable @typescript-eslint/no-explicit-any */
export type NotificationsSettingsT = {
  telegram: {
    connection: {
      status: 'active' | 'blocked' | 'replaced';
    };
    contact: {
      link: string;
      title: string;
      is_public: boolean;
    };
  };
};

// Типы уведомлений
export type NotificationType =
  | 'message'
  | 'lesson_reminder'
  | 'new_material'
  | 'payment_success'
  | 'group_invitation'
  | 'system_update'
  | 'birthday'
  | 'general';

// Структура уведомления
export type NotificationT = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  userId?: string;
  metadata?: Record<string, any>;
};

// События SocketIO для уведомлений
export type NotificationSocketEvents = {
  'notification:new': NotificationT;
  'notification:read': { id: string };
  'notification:read_all': void;
  'notification:delete': { id: string };
  'notification:test': NotificationT;
};

// Состояние уведомлений
export type NotificationsStateT = {
  notifications: NotificationT[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
};
