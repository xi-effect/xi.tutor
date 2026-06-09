import { PaymentStatusT } from 'common.types';

// Приватная константа - не экспортируется напрямую, чтобы избежать использования как селектора Zustand
const _statusTextColorMap: Record<PaymentStatusT, string> = {
  complete: 'text-green-80',
  wf_receiver_confirmation: 'text-brand-80',
  wf_sender_confirmation: 'text-orange-80',
};

/** Синхронизировано с paymentStatusBadgeClasses в common.ui */
const _statusBgColorMap: Record<PaymentStatusT, string> = {
  complete: 'text-green-80 bg-green-0 dark:bg-[#ECF8EC] dark:text-[#2E842E]',
  wf_receiver_confirmation: 'text-brand-80 bg-brand-0 dark:bg-[#F3F4FC] dark:text-[#4554C9]',
  wf_sender_confirmation: 'text-orange-80 bg-orange-0 dark:bg-[#FBF3EE] dark:text-[#B85727]',
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
