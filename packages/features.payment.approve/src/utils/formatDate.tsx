import i18n from 'i18next';
import {
  formatAppClock,
  formatInAppTimeZone,
  getAppCalendarDayDiff,
  getDateLocale,
} from 'common.ui';

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const classnameFirstLine = 'text-s-base text-text-primary';
  const classnameSecondLine = 'text-xs-base text-text-secondary';

  if (Number.isNaN(date.getTime())) {
    return <p className={classnameFirstLine}>{dateStr}</p>;
  }

  const locale = getDateLocale();
  const formattedTime = <p className={classnameSecondLine}>{formatAppClock(date)}</p>;
  const dayDiff = getAppCalendarDayDiff(date);

  if (dayDiff === 0) {
    return (
      <>
        <p className={classnameFirstLine}>{i18n.t('date.today', { ns: 'paymentApprove' })}</p>
        {formattedTime}
      </>
    );
  }

  if (dayDiff === -1) {
    return (
      <>
        <p className={classnameFirstLine}>{i18n.t('date.yesterday', { ns: 'paymentApprove' })}</p>
        {formattedTime}
      </>
    );
  }

  return (
    <>
      <p className={classnameFirstLine}>
        {formatInAppTimeZone(date, { day: 'numeric', month: 'long' }, locale)}
      </p>
      {formattedTime}
    </>
  );
};
