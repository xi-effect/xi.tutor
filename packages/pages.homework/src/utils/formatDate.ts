import { formatInAppTimeZone, getAppCalendarDayDiff, getDateLocale } from 'common.ui';

type DateTranslator = (key: string, options?: Record<string, unknown>) => string;

export const formatDueDate = (isoDate: string, now: Date = new Date()): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const sameYear = date.getFullYear() === now.getFullYear();
  return formatInAppTimeZone(
    date,
    sameYear
      ? { day: 'numeric', month: 'long' }
      : { day: 'numeric', month: 'long', year: 'numeric' },
    getDateLocale(),
  );
};

/** Относительная метка, как на карточках материалов. */
export const formatUpdatedLabel = (isoDate: string, t: DateTranslator): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMinutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
  const diffHours = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 3_600_000));
  const diffDays = Math.max(0, -getAppCalendarDayDiff(date, now));

  if (diffMinutes < 1) return t('date.justNow');
  if (diffMinutes < 60) return t('date.minutesAgo', { count: diffMinutes });
  if (diffHours < 24 && diffDays === 0) return t('date.hoursAgo', { count: diffHours });
  if (diffDays === 1) return t('date.yesterday');
  if (diffDays < 7) return t('date.daysAgo', { count: diffDays });

  return formatDueDate(isoDate, now);
};
