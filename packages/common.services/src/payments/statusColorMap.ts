import { PaymentStatusT } from 'common.types';

// Приватная константа - не экспортируется напрямую, чтобы избежать использования как селектора Zustand
const _statusTextColorMap: Record<PaymentStatusT, string> = {
  complete: 'text-status-success-text',
  wf_receiver_confirmation: 'text-text-link',
  wf_sender_confirmation: 'text-tag-orange-accent',
};

/** Синхронизировано с paymentStatusBadgeClasses в common.ui */
const _statusBgColorMap: Record<PaymentStatusT, string> = {
  complete: 'text-status-success-text bg-status-success-background',
  wf_receiver_confirmation: 'text-text-link bg-status-info-background',
  wf_sender_confirmation: 'text-tag-orange-accent bg-tag-orange-background',
};

/**
 * Безопасное получение цвета статуса с проверкой на существование ключа
 * @param status - статус платежа
 * @param withBg - нужно ли добавлять bg-класс
 * @returns CSS класс или пустую строку, если статус не найден
 */

export const getStatusColor = (
  status: PaymentStatusT | string | undefined,
  withBg?: boolean,
): string => {
  if (!status || !(status in _statusTextColorMap)) {
    return '';
  }

  const statusKey = status as PaymentStatusT;

  if (withBg) {
    return _statusBgColorMap[statusKey];
  }

  return `${_statusTextColorMap[statusKey]} bg-transparent`;
};

// Экспортируем через геттер, чтобы предотвратить использование как селектора Zustand
// @deprecated Используйте getStatusColor вместо прямого доступа к statusColorMap
export const statusColorMap = new Proxy(_statusTextColorMap, {
  get(target, prop) {
    if (prop in target) {
      return target[prop as PaymentStatusT];
    }
    return undefined;
  },
  set() {
    return false; // Запрещаем изменение
  },
}) as Readonly<Record<PaymentStatusT, string>>;
