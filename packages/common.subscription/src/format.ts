import { MB, GB, type PlanId } from './tariffs';

export const formatRub = (amount: number, locale = 'ru-RU'): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatBytes = (bytes: number, locale = 'ru-RU'): string => {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  if (bytes >= GB) {
    return `${formatter.format(bytes / GB)} ГБ`;
  }

  if (bytes >= MB) {
    return `${formatter.format(bytes / MB)} МБ`;
  }

  return `${formatter.format(bytes)} Б`;
};

export const bytesToMb = (bytes: number): number => Math.round(bytes / MB);

/** Занятое место и квота: МБ на Базовом, ГБ на Про. */
export const formatPlanStorage = (bytes: number, planId: PlanId, locale = 'ru-RU'): string => {
  const unitBytes = planId === 'pro' ? GB : MB;
  const unitLabel = planId === 'pro' ? 'ГБ' : 'МБ';
  const value = bytes / unitBytes;
  let maximumFractionDigits = 2;
  if (value > 0 && value < 0.01) maximumFractionDigits = 4;
  else if (value >= 10) maximumFractionDigits = 1;

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);

  return `${formatted} ${unitLabel}`;
};
