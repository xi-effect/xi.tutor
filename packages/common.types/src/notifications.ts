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
  | 'general'
  | 'custom_v1' // Кастомный тип уведомления
  | 'individual_invitation_accepted_v1'
  | 'group_invitation_accepted_v1'
  | 'enrollment_created_v1'
  | 'classroom_conference_started_v1'
  | 'recipient_invoice_created_v1'
  | 'student_recipient_invoice_payment_confirmed_v1';

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
  'new-notification': NotificationT; // Новое уведомление от сервера (push event)
  // /=tmexio-SUB=/new-notification/ - техническая особенность бэка, имя события просто "new-notification"
};

// HTTP API типы для запросов
export type NotificationSearchRequest = {
  cursor?: string;
  limit?: number; // 0 < limit < 100, default 12
};

// HTTP API типы для ответов
// POST /notifications/searches/ возвращает массив RecipientNotification (обёрнутый формат)
export type RecipientNotificationResponse = {
  read_at: string | null;
  notification: {
    id: string;
    created_at: string;
    updated_at?: string;
    payload: {
      kind: string;
      [key: string]: any;
    };
    actor_user_id?: number | null;
  };
};

export type NotificationsSearchResponse = RecipientNotificationResponse[];

// GET /unread-notifications-count/ возвращает integer
// В query может быть limit?: number (>0, ≤100, default 100)

// Состояние уведомлений
export type NotificationsStateT = {
  notifications: NotificationT[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor?: string;
};
