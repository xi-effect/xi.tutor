import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.locale('ru');

export const formatDate = (dateStr: string) => {
  const date = dayjs(dateStr);

  const classnameFirstLine = 'text-gray-100 font-normal text-s-base';
  const classnameSecondLine = 'text-gray-60 font-normal text-xs-base';

  //const formattedDate = <p className={classnameFirstLine}>{date.format('D MMMM HH:mm')}</p>;

  const formattedTime = <p className={classnameSecondLine}>{date.format('HH:mm')}</p>;

  if (date.isToday()) {
    return (
      <>
        <p className={classnameFirstLine}>Сегодня</p>
        {formattedTime}
      </>
    );
  }

  if (date.isYesterday()) {
    return (
      <>
        <p className={classnameFirstLine}>Вчера</p>
        {formattedTime}
      </>
    );
  }

  return (
    <>
      <p className={classnameFirstLine}>{date.format('D MMMM')}</p>
      <p className={classnameSecondLine}>{date.format('HH:mm')}</p>
    </>
  );
};
