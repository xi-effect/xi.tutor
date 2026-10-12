import { formatAppClock, formatInAppTimeZone, getDateLocale } from 'common.ui';

export const formatPaymentDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const locale = getDateLocale();
  const dayMonth = formatInAppTimeZone(date, { day: 'numeric', month: 'long' }, locale);
  return `${dayMonth}, ${formatAppClock(date)}`;
};
