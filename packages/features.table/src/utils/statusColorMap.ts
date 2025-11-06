import { PaymentStatusT } from '../types';

export const statusColorMap: Record<PaymentStatusT, string> = {
  complete: 'text-green-100',
  wf_receiver_confirmation: 'text-brand-100',
  wf_sender_confirmation: 'text-red-100',
};

/**
 * Безопасное получение цвета статуса с проверкой на существование ключа
 * @param status - статус платежа
 * @returns CSS класс для цвета статуса или пустую строку, если статус не найден
 */
export const getStatusColor = (status: PaymentStatusT | string | undefined): string => {
  if (!status || !(status in statusColorMap)) {
    return '';
  }
  return statusColorMap[status as PaymentStatusT];
};
