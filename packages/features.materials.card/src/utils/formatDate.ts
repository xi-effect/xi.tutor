import i18n from 'i18next';
import { formatInAppTimeZone, getAppCalendarDayDiff, getDateLocale } from 'common.ui';

const tDate = (key: string, options?: Record<string, unknown>) =>
  String(i18n.t(`date.${key}`, { ns: 'materialsCard', ...options }));

export const formatToShortDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return formatInAppTimeZone(date, { day: 'numeric', month: 'long' }, getDateLocale());
};

/** Относительная метка: минуту назад / N часов назад / вчера / дата */
export const formatUpdatedLabel = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMinutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
  const diffHours = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 3_600_000));
  const diffDays = Math.max(0, -getAppCalendarDayDiff(date, now));

  if (diffMinutes < 1) return tDate('justNow');
  if (diffMinutes < 60) return tDate('minutesAgo', { count: diffMinutes });
  if (diffHours < 24 && diffDays === 0) return tDate('hoursAgo', { count: diffHours });
  if (diffDays === 1) return tDate('yesterday');
  if (diffDays < 7) return tDate('daysAgo', { count: diffDays });

  return formatToShortDate(isoDate);
};
