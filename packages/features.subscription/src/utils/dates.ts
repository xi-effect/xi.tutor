import { formatInAppTimeZone, getDateLocale } from 'common.ui';

const formatDayMonth = (iso: string, withYear: boolean): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const locale = getDateLocale();
  const dayMonth = formatInAppTimeZone(date, { day: 'numeric', month: 'long' }, locale);
  if (!withYear) return dayMonth;
  const year = formatInAppTimeZone(date, { year: 'numeric' }, 'en-US');
  return `${dayMonth} ${year}`;
};

export const formatRenewalDate = (iso: string): string => formatDayMonth(iso, true);

export const formatRenewalDateShort = (iso: string): string => formatDayMonth(iso, false);
