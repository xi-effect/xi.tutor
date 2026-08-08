/* eslint-disable @typescript-eslint/no-explicit-any */

export type NotificationGroupKind = 'classrooms' | 'invoices' | 'events' | 'event_reminders';

export type DeliveryMethodKind = 'email' | 'telegram' | 'vk';

export type DeliveryMethodStatus = 'active' | 'blocked' | 'replaced';

export type DeliveryMethodEnriched = {
  delivery_method: {
    status: DeliveryMethodStatus;
  };
  related_contact: {
    link: string;
    title: string;
    is_public: boolean;
  } | null;
  /** Актуальный контракт на проде */
  enabled_notification_categories?: NotificationGroupKind[];
  /** @deprecated старое имя из черновика OpenAPI */
  enabled_notification_groups?: NotificationGroupKind[];
};

export type DeliveryMethodsResponse = {
  email: DeliveryMethodEnriched | null;
  telegram: DeliveryMethodEnriched | null;
  vk: DeliveryMethodEnriched | null;
};

/** Ответ POST .../delivery-methods/vk/connection-requests/ */
export type VKConnectionStartResponse = {
  /** ID сообщества VK для виджета AllowMessagesFromCommunity */
  group_id: number;
  key: string;
};

/** @deprecated Используйте DeliveryMethodsResponse */
export type NotificationsSettingsT = DeliveryMethodsResponse;

/** Инстанс занятия: одноразовое создание / перенос / отмена / напоминание о конкретном занятии */
export type ClassroomEventInstanceNotificationKind =
  | 'single_classroom_event_created_v1'
  | 'classroom_event_instance_rescheduled_v1'
  | 'classroom_event_instance_cancelled_v1'
  | 'persisted_classroom_event_instance_reminder_v1';

export type ClassroomEventInstanceNotificationPayload = {
  kind: ClassroomEventInstanceNotificationKind;
  classroom_id: number;
  event_instance_id: string;
};

/** Повторяющийся виртуальный инстанс: напоминание о конкретном занятии серии */
export type ClassroomRepeatedEventInstanceNotificationKind =
  'repeated_classroom_event_instance_reminder_v1';

export type ClassroomRepeatedEventInstanceNotificationPayload = {
  kind: ClassroomRepeatedEventInstanceNotificationKind;
  classroom_id: number;
  repetition_mode_id: string;
  instance_index: number;
};

/** Расписание / повторение: фокус на дате, без привязки к одному инстансу */
export type ClassroomScheduleFocusNotificationKind =
  | 'repeating_classroom_event_created_v1'
  | 'classroom_event_repetition_updated_v1'
  | 'classroom_event_repetition_cancelled_v1';

export type ClassroomScheduleFocusNotificationPayload = {
  kind: ClassroomScheduleFocusNotificationKind;
  classroom_id: number;
  /** ISO-8601 — диплинк `focused_at` (для отмены и серии) */
  focused_at?: string;
  /** Альтернативное имя поля времени от бэка */
  starts_at?: string;
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
  | 'student_recipient_invoice_payment_confirmed_v1'
  | ClassroomEventInstanceNotificationKind
  | ClassroomRepeatedEventInstanceNotificationKind
  | ClassroomScheduleFocusNotificationKind;

/** Остальные payload с прежней гибкой формой полей */
export type NotificationLegacyPayload = {
  kind: Exclude<
    NotificationKind,
    | ClassroomEventInstanceNotificationKind
    | ClassroomRepeatedEventInstanceNotificationKind
    | ClassroomScheduleFocusNotificationKind
  >;
  [key: string]: any;
};

export type NotificationPayload =
  | ClassroomEventInstanceNotificationPayload
  | ClassroomRepeatedEventInstanceNotificationPayload
  | ClassroomScheduleFocusNotificationPayload
  | NotificationLegacyPayload;

// Структура уведомления (новый контракт)
export type NotificationT = {
  id: string;
  actor_user_id: number | null;
  is_read: boolean;
  payload: NotificationPayload;
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
    payload: NotificationPayload;
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
