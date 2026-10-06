import { PRODUCT_ANALYTICS_EVENTS } from './events';
import { trackProductEvent } from './umami';

export type PaymentConfirmationKind = 'receiver' | 'unilateral';

/** Сумма счёта → число для Umami Revenue (точность до 4 знаков). */
export function parsePaymentRevenue(total: string | number | null | undefined): number | null {
  if (total === null || total === undefined) return null;

  const normalized =
    typeof total === 'number' ? String(total) : total.replace(/\s/g, '').replace(',', '.');
  if (normalized === '') return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;

  return Math.round(value * 10000) / 10000;
}

/**
 * Outcome завершённой оплаты. Подтверждение ученика («я оплатил») сюда не входит:
 * деньги ещё не приняты, иначе Revenue посчитает счёт дважды.
 */
export function trackPaymentConfirmed(
  total: string | number | null | undefined,
  confirmation: PaymentConfirmationKind,
): void {
  const revenue = parsePaymentRevenue(total);
  if (revenue === null) return;

  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.PAYMENT_CONFIRMED, {
    revenue,
    currency: 'RUB',
    confirmation,
  });
}
