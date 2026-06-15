import type { NotificationT } from 'common.types';
import {
  CallsQueryKey,
  ClassroomsQueryKey,
  EnrollmentsQueryKey,
  PaymentsQueryKey,
  StudentQueryKey,
} from 'common.api';
import { schedulerQueryKeys } from '../scheduler';

const CUSTOM_NOTIFICATION_CONTENT_MAX_LENGTH = 80;

const isDevEnv = (): boolean =>
  (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') ||
  (typeof import.meta !== 'undefined' &&
    Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV));

const warnIncompleteNotificationPayload = (kind: string, reason: string): void => {
  if (isDevEnv()) {
    console.warn(`[notifications] incomplete payload for kind "${kind}": ${reason}`);
  }
};

const truncateText = (text: string, maxLength: number): string => {
  if (typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
};

/**
 * Тип для функции генерации ссылки на основе payload уведомления
 */
type NotificationActionFn = (payload: NotificationT['payload']) => string | null;

/**
 * Тип для ключей ревалидации кеша
 */
type InvalidationKey = string | readonly [string, ...unknown[]];

const getScheduleCacheInvalidationKeys = (
  classroomId: number,
  options?: { includeInstanceDetails?: boolean },
): InvalidationKey[] => {
  const keys: InvalidationKey[] = [
    schedulerQueryKeys.tutorAllForClassroom(classroomId),
    schedulerQueryKeys.studentAllForClassroom(classroomId),
    schedulerQueryKeys.tutorScheduleAll(),
    schedulerQueryKeys.studentScheduleAll(),
  ];

  if (options?.includeInstanceDetails) {
    keys.push(
      schedulerQueryKeys.tutorEventInstanceDetailsForClassroom(classroomId),
      schedulerQueryKeys.studentEventInstanceDetailsForClassroom(classroomId),
      schedulerQueryKeys.tutorRepeatedEventInstanceDetailsForClassroom(classroomId),
      schedulerQueryKeys.studentRepeatedEventInstanceDetailsForClassroom(classroomId),
    );
  }

  return keys;
};

const normalizeNotificationClassroomId = (payload: NotificationT['payload']): number | null => {
  if (payload == null || typeof payload !== 'object') return null;
  const id = (payload as { classroom_id?: unknown }).classroom_id;
  if (typeof id === 'number' && Number.isFinite(id)) return id;
  if (typeof id === 'string' && id.trim().length > 0) {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const readIsoString = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return null;
};

/** ISO-время занятия для диплинка `focused_at` (бэк может прислать разные имена полей). */
export const readScheduleFocusIsoFromPayload = (payload: NotificationT['payload']): string => {
  if (payload == null || typeof payload !== 'object') return '';
  const record = payload as Record<string, unknown>;

  for (const key of ['focused_at', 'starts_at', 'start_at', 'cancelled_at', 'instance_starts_at']) {
    const direct = readIsoString(record[key]);
    if (direct) return direct;
  }

  const nested = record.persisted_event_instance ?? record.event_instance ?? record.instance;
  if (nested != null && typeof nested === 'object') {
    const slot = nested as Record<string, unknown>;
    const fromNested = readIsoString(slot.starts_at) ?? readIsoString(slot.start_at);
    if (fromNested) return fromNested;
  }

  return '';
};

const buildClassroomEventInstanceAction: NotificationActionFn = (payload) => {
  const classroomId = normalizeNotificationClassroomId(payload);
  const eventInstanceId =
    'event_instance_id' in payload ? String(payload.event_instance_id).trim() : '';
  if (classroomId == null) {
    warnIncompleteNotificationPayload(payload.kind, 'missing classroom_id');
    return null;
  }
  if (!eventInstanceId) {
    warnIncompleteNotificationPayload(payload.kind, 'missing event_instance_id');
    return null;
  }
  const q = new URLSearchParams({ tab: 'schedule', event_instance_id: eventInstanceId });
  return `/classrooms/${classroomId}?${q.toString()}`;
};

const readRepetitionModeId = (payload: NotificationT['payload']): string => {
  if (payload == null || typeof payload !== 'object' || !('repetition_mode_id' in payload)) {
    return '';
  }
  return String(payload.repetition_mode_id).trim();
};

const readInstanceIndex = (payload: NotificationT['payload']): number | null => {
  if (payload == null || typeof payload !== 'object' || !('instance_index' in payload)) {
    return null;
  }
  const value = payload.instance_index;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const buildClassroomRepeatedEventInstanceAction: NotificationActionFn = (payload) => {
  const classroomId = normalizeNotificationClassroomId(payload);
  const repetitionModeId = readRepetitionModeId(payload);
  const instanceIndex = readInstanceIndex(payload);

  if (classroomId == null) {
    warnIncompleteNotificationPayload(payload.kind, 'missing classroom_id');
    return null;
  }
  if (!repetitionModeId) {
    warnIncompleteNotificationPayload(payload.kind, 'missing repetition_mode_id');
    return null;
  }
  if (instanceIndex == null) {
    warnIncompleteNotificationPayload(payload.kind, 'missing instance_index');
    return null;
  }

  const q = new URLSearchParams({
    tab: 'schedule',
    repetition_mode_id: repetitionModeId,
    instance_index: String(instanceIndex),
  });
  return `/classrooms/${classroomId}?${q.toString()}`;
};

const buildClassroomScheduleFocusAction: NotificationActionFn = (payload) => {
  const classroomId = normalizeNotificationClassroomId(payload);
  const focusedAt = readScheduleFocusIsoFromPayload(payload);
  if (classroomId == null || !focusedAt) return null;
  const q = new URLSearchParams({ tab: 'schedule', focused_at: focusedAt });
  return `/classrooms/${classroomId}?${q.toString()}`;
};

const scheduleOnNotify = (
  payload: NotificationT['payload'],
  options?: { includeInstanceDetails?: boolean },
): InvalidationKey[] | null => {
  const classroomId = normalizeNotificationClassroomId(payload);
  if (classroomId == null) return null;
  return getScheduleCacheInvalidationKeys(classroomId, options);
};

/**
 * Конфигурация уведомления
 */
export type NotificationConfig = {
  /** Текст заголовка уведомления или функция генерации на основе payload */
  title: string | ((payload: NotificationT['payload']) => string);
  /** Функция генерации описания уведомления на основе payload */
  description: (payload: NotificationT['payload']) => string;
  /** Функция генерации ссылки для перехода при клике на уведомление */
  action: NotificationActionFn;
  /** Ключи для ревалидации кеша React Query */
  invalidationKeys: InvalidationKey[];
  /** Если true, по клику открывается модалка (действие не на платформе) */
  opensModal?: boolean;
  onNotify?: (payload: NotificationT['payload']) => InvalidationKey[] | null;
};

/**
 * Конфигурация всех типов уведомлений
 */
export const notificationConfigs: Record<string, NotificationConfig> = {
  // ученик
  classroom_conference_started_v1: {
    title: 'Занятие началось',
    description: () => 'Присоединяйтесь к видеозвонку',
    action: (payload) => {
      const classroomId = payload?.classroom_id;
      return classroomId ? `/classrooms/${classroomId}?role=student&goto=call` : null;
    },
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => {
      const classroomId = payload?.classroom_id;
      if (typeof classroomId === 'number') {
        return [[CallsQueryKey.GetParticipantsStudent, classroomId.toString()]];
      }
      return null;
    },
  },

  single_classroom_event_created_v1: {
    title: 'Новое занятие в расписании',
    description: () => 'Нажмите, чтобы узнать подробности',
    action: buildClassroomEventInstanceAction,
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => scheduleOnNotify(payload, { includeInstanceDetails: true }),
  },

  classroom_event_instance_rescheduled_v1: {
    title: 'Занятие перенесено',
    description: () => 'Изменение касается только этого занятия. Нажмите, чтобы узнать подробности',
    action: buildClassroomEventInstanceAction,
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => scheduleOnNotify(payload, { includeInstanceDetails: true }),
  },

  classroom_event_instance_cancelled_v1: {
    title: 'Занятие отменено',
    description: () => 'Изменение касается только этого занятия. Нажмите, чтобы узнать подробности',
    action: buildClassroomEventInstanceAction,
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => scheduleOnNotify(payload, { includeInstanceDetails: true }),
  },

  persisted_classroom_event_instance_reminder_v1: {
    title: 'Занятие скоро начнётся',
    description: () => 'Нажмите, чтобы узнать подробности',
    action: buildClassroomEventInstanceAction,
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => scheduleOnNotify(payload, { includeInstanceDetails: true }),
  },

  repeated_classroom_event_instance_reminder_v1: {
    title: 'Занятие скоро начнётся',
    description: () => 'Нажмите, чтобы узнать подробности',
    action: buildClassroomRepeatedEventInstanceAction,
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => scheduleOnNotify(payload, { includeInstanceDetails: true }),
  },

  repeating_classroom_event_created_v1: {
    title: 'В ваше расписание добавлены новые регулярные занятия',
    description: () => 'Нажмите, чтобы узнать подробности',
    action: buildClassroomScheduleFocusAction,
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => scheduleOnNotify(payload, { includeInstanceDetails: true }),
  },

  classroom_event_repetition_updated_v1: {
    title: 'Изменилось расписание регулярных занятий',
    description: () => 'Изменения коснутся всех будущих занятий. Нажмите, чтобы узнать подробности',
    action: buildClassroomScheduleFocusAction,
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => scheduleOnNotify(payload, { includeInstanceDetails: true }),
  },

  classroom_event_repetition_cancelled_v1: {
    title: 'Некоторые будущие занятия отменены',
    description: () => 'Нажмите, чтобы узнать подробности и посмотреть обновлённое расписание',
    action: buildClassroomScheduleFocusAction,
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => scheduleOnNotify(payload, { includeInstanceDetails: true }),
  },

  enrollment_created_v1: {
    title: 'Вас добавили в группу',
    description: () => 'Открыть группу',
    action: (payload) => {
      const classroomId = payload.classroom_id;
      return classroomId ? `/classrooms/${classroomId}?role=student` : null;
    },
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
  },

  recipient_invoice_created_v1: {
    title: 'Вы получили новый счёт',
    description: () => 'Пожалуйста, оплатите его',
    action: (payload) => {
      const recipientInvoiceId =
        'recipient_invoice_id' in payload ? payload.recipient_invoice_id : undefined;
      return recipientInvoiceId
        ? `/payments?role=student&tab=invoices&recipient_invoice_id=${recipientInvoiceId}`
        : '/payments?role=student&tab=invoices';
    },
    invalidationKeys: [PaymentsQueryKey.StudentPayments],
  },

  // репетитор
  student_recipient_invoice_payment_confirmed_v1: {
    title: 'Оплачен новый счёт',
    description: () => 'Подтвердите, что получили деньги',
    action: (payload) => {
      const recipientInvoiceId =
        'recipient_invoice_id' in payload ? payload.recipient_invoice_id : undefined;
      return recipientInvoiceId
        ? `/payments?role=tutor&tab=invoices&recipient_invoice_id=${recipientInvoiceId}`
        : '/payments?role=tutor&tab=invoices';
    },
    invalidationKeys: [PaymentsQueryKey.TutorPayments],
  },

  individual_invitation_accepted_v1: {
    title: 'У вас появился новый кабинет',
    description: () => 'Открыть кабинет',
    action: (payload) => {
      const classroomId = payload.classroom_id;
      return classroomId ? `/classrooms/${classroomId}?role=tutor` : null;
    },
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms],
  },

  group_invitation_accepted_v1: {
    title: 'В группе новый ученик',
    description: () => 'Открыть группу',
    action: (payload) => {
      const classroomId = payload.classroom_id;
      return classroomId ? `/classrooms/${classroomId}?role=tutor` : null;
    },
    invalidationKeys: [EnrollmentsQueryKey.GetAllStudents],
  },
  // Кастомное уведомление: без перехода на платформу, по клику открывается модалка
  custom_v1: {
    title: (payload) =>
      'header' in payload && payload.header != null ? String(payload.header) : 'Уведомление',
    description: (payload) =>
      truncateText(
        'content' in payload && typeof payload.content === 'string' ? payload.content : '',
        CUSTOM_NOTIFICATION_CONTENT_MAX_LENGTH,
      ),
    action: () => null,
    invalidationKeys: [],
    opensModal: true,
  },
};
