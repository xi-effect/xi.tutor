import { MB, GB } from './tariffs';

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
