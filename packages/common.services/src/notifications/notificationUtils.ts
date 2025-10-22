import type { NotificationT } from 'common.types';

/**
 * Генерирует заголовок уведомления на основе kind и payload
 */
export const generateNotificationTitle = (notification: NotificationT): string => {
  const { kind } = notification.payload;

  switch (kind) {
    case 'classroom_material_created':
      return 'Новый материал в классе';
    case 'classroom_lesson_scheduled':
      return 'Занятие запланировано';
    case 'classroom_lesson_started':
      return 'Занятие началось';
    case 'classroom_lesson_ended':
      return 'Занятие завершено';
    case 'payment_success':
      return 'Оплата прошла успешно';
    case 'payment_failed':
      return 'Ошибка оплаты';
    case 'group_invitation':
      return 'Приглашение в группу';
    case 'group_invitation_accepted':
      return 'Приглашение принято';
    case 'group_invitation_declined':
      return 'Приглашение отклонено';
    case 'system_update':
      return 'Обновление системы';
    case 'birthday':
      return 'День рождения';
    case 'general':
    default:
      return 'Уведомление';
  }
};

/**
 * Генерирует описание уведомления на основе kind и payload
 */
export const generateNotificationDescription = (notification: NotificationT): string => {
  const { kind, ...payload } = notification.payload;

  switch (kind) {
    case 'classroom_material_created':
      return `Добавлен новый материал в класс ${payload.classroom_id}`;
    case 'classroom_lesson_scheduled':
      return `Занятие запланировано на ${payload.scheduled_at}`;
    case 'classroom_lesson_started':
      return `Занятие началось в классе ${payload.classroom_id}`;
    case 'classroom_lesson_ended':
      return `Занятие завершено в классе ${payload.classroom_id}`;
    case 'payment_success':
      return `Оплата на сумму ${payload.amount} ₽ прошла успешно`;
    case 'payment_failed':
      return `Ошибка при оплате ${payload.amount} ₽`;
    case 'group_invitation':
      return `Вас пригласили в группу "${payload.group_name}"`;
    case 'group_invitation_accepted':
      return `Пользователь принял приглашение в группу "${payload.group_name}"`;
    case 'group_invitation_declined':
      return `Пользователь отклонил приглашение в группу "${payload.group_name}"`;
    case 'system_update':
      return payload.message || 'Доступно обновление системы';
    case 'birthday':
      return `У ${payload.user_name} сегодня день рождения!`;
    case 'general':
    default:
      return payload.message || 'Новое уведомление';
  }
};

/**
 * Форматирует дату для отображения
 */
export const formatNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInMinutes = Math.round(diffInMs / (1000 * 60));
  const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  // Если дата в будущем
  if (diffInMs > 0) {
    if (diffInMinutes < 60) {
      return `через ${diffInMinutes} мин.`;
    } else if (diffInHours < 24) {
      return `через ${diffInHours} ч.`;
    } else {
      return `через ${diffInDays} дн.`;
    }
  }

  // Если дата в прошлом
  if (Math.abs(diffInMinutes) < 60) {
    return `${Math.abs(diffInMinutes)} мин. назад`;
  } else if (Math.abs(diffInHours) < 24) {
    return `${Math.abs(diffInHours)} ч. назад`;
  } else if (Math.abs(diffInDays) < 7) {
    return `${Math.abs(diffInDays)} дн. назад`;
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
};

/**
 * Форматирует полную дату для tooltip
 */
export const formatFullNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Ограничивает счетчик уведомлений до 99+
 */
export const formatNotificationCount = (count: number): string => {
  return count > 99 ? '99+' : count.toString();
};
