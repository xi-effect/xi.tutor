import type { NotificationT } from 'common.types';
import { ClassroomsQueryKey, PaymentsQueryKey } from 'common.api';

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
  invalidationKeys: InvalidationKey[];
};

/**
 * Конфигурация всех типов уведомлений
 */
export const notificationConfigs: Record<string, NotificationConfig> = {
  individual_invitation_accepted_v1: {
    title: 'У вас появился новый кабинет',
    description: () => 'У вас появился новый кабинет',
    action: (payload) => {
      const classroomId = payload.classroom_id;
      return classroomId ? `/classrooms/${classroomId}` : null;
    },
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms],
  },
  group_invitation_accepted_v1: {
    title: 'В группе новый ученик',
    description: () => 'В группе новый ученик',
    action: (payload) => {
      const classroomId = payload.classroom_id;
      return classroomId ? `/classrooms/${classroomId}` : null;
    },
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms],
  },
  enrollment_created_v1: {
    title: 'Вас добавили в группу',
    description: () => 'Вас добавили в группу',
    action: (payload) => {
      const classroomId = payload.classroom_id;
      return classroomId ? `/classrooms/${classroomId}` : null;
    },
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms],
  },
  classroom_conference_started_v1: {
    title: 'Репетитор начал занятие',
    description: () => 'Репетитор начал занятие',
    action: (payload) => {
      const classroomId = payload.classroom_id;
      return classroomId ? `/call/${classroomId}` : null;
    },
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms],
  },
  recipient_invoice_created_v1: {
    title: 'Вы получили новый счёт. Пожалуйста, оплатите его',
    description: () => 'Вы получили новый счёт. Пожалуйста, оплатите его',
    action: (payload) => {
      const recipientInvoiceId = payload.recipient_invoice_id;
      return recipientInvoiceId ? `/payments?invoice=${recipientInvoiceId}` : '/payments';
    },
    invalidationKeys: [PaymentsQueryKey.StudentPayments, PaymentsQueryKey.TutorPayments],
  },
  student_recipient_invoice_payment_confirmed_v1: {
    title: 'Оплачен новый счёт. Подтвердите, что получили деньги',
    description: () => 'Оплачен новый счёт. Подтвердите, что получили деньги',
    action: (payload) => {
      const recipientInvoiceId = payload.recipient_invoice_id;
      return recipientInvoiceId ? `/payments?invoice=${recipientInvoiceId}` : '/payments';
    },
    invalidationKeys: [PaymentsQueryKey.StudentPayments, PaymentsQueryKey.TutorPayments],
  },
};
