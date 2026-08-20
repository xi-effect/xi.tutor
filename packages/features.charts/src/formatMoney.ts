export const formatMoney = (value: number, locale = 'ru-RU', currencySymbol = '₽') =>
  `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(Math.round(value))}\u00A0${currencySymbol}`;

export const formatMoneyCompact = (value: number, locale = 'ru-RU') =>
  new Intl.NumberFormat(locale, {
    notation: value >= 100000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 100000 ? 1 : 0,
  }).format(value);
