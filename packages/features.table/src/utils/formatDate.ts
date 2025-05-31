import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.locale('ru');

export const formatDate = (dateStr: string): string => {
  const date = dayjs(dateStr);

  if (date.isToday()) {
    return `Сегодня ${date.format('HH:mm')}`;
  }

  if (date.isYesterday()) {
    return `Вчера ${date.format('HH:mm')}`;
  }

  return `${date.format('D MMMM')} ${date.format('HH:mm')}`;
};
