import { NotificationGroupKind } from 'common.types';

export const NOTIFICATION_GROUP_LABELS: Record<
  NotificationGroupKind,
  { title: string; description: string }
> = {
  classrooms: {
    title: 'Кабинеты',
    description: 'Сообщать об изменениях в кабинетах',
  },
  invoices: {
    title: 'Оплата',
    description: 'Сообщать о статусе платежей',
  },
  events: {
    title: 'Изменения в расписании',
    description: 'Сообщать об отмене или переносе занятия',
  },
  event_reminders: {
    title: 'Начало занятия',
    description: 'Сообщать о начале занятия',
  },
};

export const NOTIFICATION_GROUP_ORDER: NotificationGroupKind[] = [
  'event_reminders',
  'events',
  'invoices',
  'classrooms',
];
