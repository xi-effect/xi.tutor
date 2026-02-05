import type { NotificationT } from 'common.types';
import {
  ClassroomsQueryKey,
  EnrollmentsQueryKey,
  PaymentsQueryKey,
  StudentQueryKey,
  CallsQueryKey,
} from 'common.api';

const CUSTOM_NOTIFICATION_CONTENT_MAX_LENGTH = 80;

const truncateText = (text: string, maxLength: number): string => {
  if (typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
};

const getClassroomConferenceInvalidationKeys = (
  payload: NotificationT['payload'],
): InvalidationKey[] => {
  const classroomId = payload?.classroom_id;
  const keys: InvalidationKey[] = [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms];

  if (classroomId !== undefined && classroomId !== null) {
    const classroomIdNumber = Number(classroomId);
    const classroomIdString = String(classroomId);

    if (Number.isFinite(classroomIdNumber)) {
      keys.push([ClassroomsQueryKey.GetClassroom, classroomIdNumber]);
      keys.push([StudentQueryKey.GetClassroom, classroomIdNumber]);
    }
    // Частичное совпадение по ключу обновит и tutor, и student варианты
    keys.push([CallsQueryKey.GetParticipants, classroomIdString]);
  }

  return keys;
};

const getClassroomAction = (payload: NotificationT['payload']): string | null => {
  const classroomId = payload?.classroom_id;
  return classroomId ? `/classrooms/${classroomId}` : null;
};

/**
 * Тип для функции генерации ссылки на основе payload уведомления
 */
type NotificationActionFn = (payload: NotificationT['payload']) => string | null;

/**
 * Тип для ключей ревалидации кеша
 */
type InvalidationKey = string | [string, ...unknown[]];

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
  invalidationKeys: InvalidationKey[] | ((payload: NotificationT['payload']) => InvalidationKey[]);
  /** Если true, по клику открывается модалка (действие не на платформе) */
  opensModal?: boolean;
  onNotify?: (payload: NotificationT['payload']) => void; // делаем optional
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
    invalidationKeys: getClassroomConferenceInvalidationKeys,
  },

  classroom_lesson_started: {
    title: 'Занятие началось',
    description: () => 'Присоединяйтесь к видеозвонку',
    action: (payload) => {
      const classroomId = payload?.classroom_id;
      return classroomId ? `/classrooms/${classroomId}?role=student&goto=call` : null;
    },
    invalidationKeys: getClassroomConferenceInvalidationKeys,
  },

  classroom_lesson_ended: {
    title: 'Занятие завершилось',
    description: () => 'Звонок завершен',
    action: getClassroomAction,
    invalidationKeys: getClassroomConferenceInvalidationKeys,
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
      const recipientInvoiceId = payload.recipient_invoice_id;
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
      const recipientInvoiceId = payload.recipient_invoice_id;
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
    title: (payload) => (payload?.header ? String(payload.header) : 'Уведомление'),
    description: (payload) =>
      truncateText(
        typeof payload?.content === 'string' ? payload.content : '',
        CUSTOM_NOTIFICATION_CONTENT_MAX_LENGTH,
      ),
    action: () => null,
    invalidationKeys: [],
    opensModal: true,
  },
};
