import i18n from 'i18next';
import { MB, GB, type PlanId } from './tariffs';

type ByteUnit = 'b' | 'mb' | 'gb';

const UNIT_FALLBACK: Record<ByteUnit, string> = { b: 'Б', mb: 'МБ', gb: 'ГБ' };

const unitLabel = (unit: ByteUnit): string => {
  const key = `units.${unit}`;
  const label = i18n.t(key, { ns: 'subscription', defaultValue: '' });
  return label && label !== key ? label : UNIT_FALLBACK[unit];
};

export const formatRub = (amount: number, locale = 'ru-RU'): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatBytes = (bytes: number, locale = 'ru-RU'): string => {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  if (bytes >= GB) {
    return `${formatter.format(bytes / GB)} ${unitLabel('gb')}`;
  }

  if (bytes >= MB) {
    return `${formatter.format(bytes / MB)} ${unitLabel('mb')}`;
  }

  return `${formatter.format(bytes)} ${unitLabel('b')}`;
};

export const bytesToMb = (bytes: number): number => Math.round(bytes / MB);

/** Лимит размера файла в мегабайтах с подписью единицы на языке интерфейса. */
export const formatMegabytes = (bytes: number): string =>
  `${Math.max(1, bytesToMb(bytes))} ${unitLabel('mb')}`;

/** Занятое место и квота: МБ на Базовом, ГБ на Про. */
export const formatPlanStorage = (bytes: number, planId: PlanId, locale = 'ru-RU'): string => {
  const unitBytes = planId === 'pro' ? GB : MB;
  const label = unitLabel(planId === 'pro' ? 'gb' : 'mb');
  const value = bytes / unitBytes;

  // Меньше 0,1 единицы не показываем длинной дробью: один знак и вверх, чтобы занятое место не выглядело как ноль.
  if (value > 0 && value < 0.1) {
    const ceiled = Math.ceil(value * 10) / 10;
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(ceiled);

    return `${formatted} ${label}`;
  }

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: value >= 10 ? 1 : 2,
    minimumFractionDigits: 0,
  }).format(value);

  return `${formatted} ${label}`;
};
