import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import i18n from 'i18next';
import { getAppLanguage } from 'common.ui';

const tDate = (key: string, options?: Record<string, unknown>) =>
  String(i18n.t(`date.${key}`, { ns: 'materialsCard', ...options }));

export const formatToShortDate = (isoDate: string): string => {
  return dayjs(isoDate).locale(getAppLanguage()).format('D MMMM');
};

/** Относительная метка: минуту назад / N часов назад / вчера / дата */
export const formatUpdatedLabel = (isoDate: string): string => {
  const date = dayjs(isoDate);
  if (!date.isValid()) return '';

  const now = dayjs();
  const diffMinutes = Math.max(0, now.diff(date, 'minute'));
  const diffHours = Math.max(0, now.diff(date, 'hour'));
  const diffDays = Math.max(0, now.startOf('day').diff(date.startOf('day'), 'day'));

  if (diffMinutes < 1) return tDate('justNow');
  if (diffMinutes < 60) return tDate('minutesAgo', { count: diffMinutes });
  if (diffHours < 24 && diffDays === 0) return tDate('hoursAgo', { count: diffHours });
  if (diffDays === 1) return tDate('yesterday');
  if (diffDays < 7) return tDate('daysAgo', { count: diffDays });

  return date.locale(getAppLanguage()).format('D MMMM');
};
