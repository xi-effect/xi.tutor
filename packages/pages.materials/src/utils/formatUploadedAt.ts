import { getAppCalendarDayDiff } from 'common.ui';
import { formatToShortDate } from './formatDate';

export const formatUploadedAt = (isoDate: string, todayLabel: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  if (getAppCalendarDayDiff(date) === 0) return todayLabel;
  return formatToShortDate(isoDate);
};
