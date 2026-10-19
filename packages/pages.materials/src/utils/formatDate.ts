import { formatInAppTimeZone, getDateLocale } from 'common.ui';

export const formatToShortDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return formatInAppTimeZone(date, { day: 'numeric', month: 'long' }, getDateLocale());
};
