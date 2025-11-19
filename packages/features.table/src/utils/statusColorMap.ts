import { PaymentStatusT } from '../types';

// Приватная константа - не экспортируется напрямую, чтобы избежать использования как селектора Zustand
const _statusColorMap: Record<PaymentStatusT, string> = {
  complete: 'text-green-100',
  wf_receiver_confirmation: 'text-brand-100',
  wf_sender_confirmation: 'text-orange-100',
};

/**
 * Безопасное получение цвета статуса с проверкой на существование ключа
 * @param status - статус платежа
 * @returns CSS класс для цвета статуса или пустую строку, если статус не найден
 */
export const getStatusColor = (status: PaymentStatusT | string | undefined): string => {
  if (!status || !(status in _statusColorMap)) {
    return '';
  }
  return _statusColorMap[status as PaymentStatusT];
};

// Экспортируем через геттер, чтобы предотвратить использование как селектора Zustand
// @deprecated Используйте getStatusColor вместо прямого доступа к statusColorMap
export const statusColorMap = new Proxy(_statusColorMap, {
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
