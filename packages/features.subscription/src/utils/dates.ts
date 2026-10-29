import { formatInAppTimeZone, getAppTimeZone, getDateLocale } from 'common.ui';

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

export const getRenewalHoverDate = (
  iso: string,
): { day: number; before: string; after: string } | null => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const yearOf = (value: Date) => formatInAppTimeZone(value, { year: 'numeric' }, 'en-US');
  const withYear = yearOf(date) !== yearOf(new Date());
  const parts = new Intl.DateTimeFormat(getDateLocale(), {
    day: 'numeric',
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: getAppTimeZone(),
  }).formatToParts(date);

  let before = '';
  let after = '';
  let day = Number.NaN;
  let seenDay = false;

  for (const part of parts) {
    if (part.type === 'day') {
      day = Number(part.value);
      seenDay = true;
      continue;
    }

    if (seenDay) after += part.value;
    else before += part.value;
  }

  if (Number.isNaN(day)) return null;

  return { day, before: before.trim(), after: after.trim() };
};
