import type { NotificationT } from 'common.types';
import {
  ClassroomsQueryKey,
  EnrollmentsQueryKey,
  PaymentsQueryKey,
  StudentQueryKey,
  CallsQueryKey,
} from 'common.api';
import { queryClient } from 'common.config';

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
    invalidationKeys: [ClassroomsQueryKey.GetClassrooms, StudentQueryKey.Classrooms],
    onNotify: (payload) => {
      const classroomId = payload?.classroom_id;
      if (!classroomId) return;

      queryClient.refetchQueries({
        queryKey: [CallsQueryKey.GetParticipants, classroomId],
        exact: false,
      });
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
};
