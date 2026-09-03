import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import { formatToShortDate } from './formatDate';

dayjs.extend(isToday);

export const formatUploadedAt = (isoDate: string, todayLabel: string): string => {
  const date = dayjs(isoDate);
  if (!date.isValid()) return isoDate;
  if (date.isToday()) return todayLabel;
  return formatToShortDate(isoDate);
};
