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

// Типы уведомлений (kind в payload)
export type NotificationKind =
  | 'classroom_material_created'
  | 'classroom_lesson_scheduled'
  | 'classroom_lesson_started'
  | 'classroom_lesson_ended'
  | 'payment_success'
  | 'payment_failed'
  | 'group_invitation'
  | 'group_invitation_accepted'
  | 'group_invitation_declined'
  | 'system_update'
  | 'birthday'
  | 'general';

// Структура уведомления (новый контракт)
export type NotificationT = {
  id: string;
  actor_user_id: number | null;
  is_read: boolean;
  payload: {
    kind: NotificationKind;
    [key: string]: any; // Дополнительные атрибуты в зависимости от kind
  };
  created_at: string;
  updated_at: string;
};

// Старая структура для совместимости (будет удалена)
export type LegacyNotificationT = {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  userId?: string;
  metadata?: Record<string, any>;
};

// События SocketIO для уведомлений
export type NotificationSocketEvents = {
  'create-notification': NotificationT; // Новое уведомление от сервера
  'notification:read': { id: string };
  'notification:read_all': void;
  'notification:delete': { id: string };
  'notification:test': NotificationT;
};

// HTTP API типы
export type NotificationsListResponse = {
  notifications: NotificationT[];
  has_more: boolean;
  next_cursor?: string;
};

export type NotificationCountResponse = {
  count: number;
};

// Состояние уведомлений
export type NotificationsStateT = {
  notifications: NotificationT[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor?: string;
};
