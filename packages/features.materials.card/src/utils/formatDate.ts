import dayjs from 'dayjs';
import 'dayjs/locale/ru';

export const formatToShortDate = (isoDate: string): string => {
  return dayjs(isoDate).locale('ru').format('D MMMM');
};

/** Относительная метка для карточки: сегодня / вчера / дата */
export const formatUpdatedLabel = (isoDate: string): string => {
  const date = dayjs(isoDate).locale('ru');
  const today = dayjs().startOf('day');
  const target = date.startOf('day');
  const diffDays = today.diff(target, 'day');

  if (diffDays === 0) return 'сегодня';
  if (diffDays === 1) return 'вчера';

  return date.format('D MMMM');
};
