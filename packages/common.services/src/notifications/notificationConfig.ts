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
    title: 'Новое занятие',
    description: () => 'Одноразовое занятие добавлено в расписание',
    action: (payload) => {
      const classroomId = payload.classroom_id;
      const eventInstanceId =
        'event_instance_id' in payload ? String(payload.event_instance_id).trim() : '';
      if (typeof classroomId !== 'number' || !eventInstanceId) return null;
      const q = new URLSearchParams({ tab: 'schedule', event_instance_id: eventInstanceId });
      return `/classrooms/${classroomId}?${q.toString()}`;
    },
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => {
      const cid = payload.classroom_id;
      if (typeof cid !== 'number') return null;
      return [
        schedulerQueryKeys.tutorAllForClassroom(cid),
        schedulerQueryKeys.studentAllForClassroom(cid),
      ];
    },
  },

  classroom_event_instance_rescheduled_v1: {
    title: 'Занятие перенесено',
    description: () => 'Время занятия в расписании изменено',
    action: (payload) => {
      const classroomId = payload.classroom_id;
      const eventInstanceId =
        'event_instance_id' in payload ? String(payload.event_instance_id).trim() : '';
      if (typeof classroomId !== 'number' || !eventInstanceId) return null;
      const q = new URLSearchParams({ tab: 'schedule', event_instance_id: eventInstanceId });
      return `/classrooms/${classroomId}?${q.toString()}`;
    },
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => {
      const cid = payload.classroom_id;
      if (typeof cid !== 'number') return null;
      return [
        schedulerQueryKeys.tutorAllForClassroom(cid),
        schedulerQueryKeys.studentAllForClassroom(cid),
      ];
    },
  },

  classroom_event_instance_cancelled_v1: {
    title: 'Занятие отменено',
    description: () => 'Конкретное занятие убрано из расписания',
    action: (payload) => {
      const classroomId = payload.classroom_id;
      const eventInstanceId =
        'event_instance_id' in payload ? String(payload.event_instance_id).trim() : '';
      if (typeof classroomId !== 'number' || !eventInstanceId) return null;
      const q = new URLSearchParams({ tab: 'schedule', event_instance_id: eventInstanceId });
      return `/classrooms/${classroomId}?${q.toString()}`;
    },
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => {
      const cid = payload.classroom_id;
      if (typeof cid !== 'number') return null;
      return [
        schedulerQueryKeys.tutorAllForClassroom(cid),
        schedulerQueryKeys.studentAllForClassroom(cid),
      ];
    },
  },

  repeating_classroom_event_created_v1: {
    title: 'Новая серия занятий',
    description: () => 'В расписание добавлено повторяющееся занятие',
    action: (payload) => {
      const classroomId = payload.classroom_id;
      const focusedAt = 'focused_at' in payload ? String(payload.focused_at).trim() : '';
      if (typeof classroomId !== 'number' || !focusedAt) return null;
      const q = new URLSearchParams({ tab: 'schedule', focused_at: focusedAt });
      return `/classrooms/${classroomId}?${q.toString()}`;
    },
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => {
      const cid = payload.classroom_id;
      if (typeof cid !== 'number') return null;
      return [
        schedulerQueryKeys.tutorAllForClassroom(cid),
        schedulerQueryKeys.studentAllForClassroom(cid),
      ];
    },
  },

  classroom_event_repetition_updated_v1: {
    title: 'Повторение занятий обновлено',
    description: () => 'Изменены правила повторения в расписании',
    action: (payload) => {
      const classroomId = payload.classroom_id;
      const focusedAt = 'focused_at' in payload ? String(payload.focused_at).trim() : '';
      if (typeof classroomId !== 'number' || !focusedAt) return null;
      const q = new URLSearchParams({ tab: 'schedule', focused_at: focusedAt });
      return `/classrooms/${classroomId}?${q.toString()}`;
    },
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => {
      const cid = payload.classroom_id;
      if (typeof cid !== 'number') return null;
      return [
        schedulerQueryKeys.tutorAllForClassroom(cid),
        schedulerQueryKeys.studentAllForClassroom(cid),
      ];
    },
  },

  classroom_event_repetition_cancelled_v1: {
    title: 'Повторение отменено',
    description: () => 'Серия занятий больше не повторяется',
    action: (payload) => {
      const classroomId = payload.classroom_id;
      const focusedAt = 'focused_at' in payload ? String(payload.focused_at).trim() : '';
      if (typeof classroomId !== 'number' || !focusedAt) return null;
      const q = new URLSearchParams({ tab: 'schedule', focused_at: focusedAt });
      return `/classrooms/${classroomId}?${q.toString()}`;
    },
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => {
      const cid = payload.classroom_id;
      if (typeof cid !== 'number') return null;
      return [
        schedulerQueryKeys.tutorAllForClassroom(cid),
        schedulerQueryKeys.studentAllForClassroom(cid),
      ];
    },
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
