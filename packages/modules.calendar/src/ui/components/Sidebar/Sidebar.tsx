import { Button } from '@xipkg/button';
import { Calendar } from '@xipkg/calendar';
import { useTranslation } from 'react-i18next';

export const Sidebar = () => {
  const { t } = useTranslation('calendar');

  return (
    <div className="border-gray-10 hidden h-full min-h-full w-[320px] flex-col justify-between self-start px-2 py-1 md:flex">
      <div>
        <Button className="mb-4 h-[40px] w-full rounded-xl">{t('add_event')}</Button>
        <p className="text-center dark:text-gray-100">{t('pick_time')}</p>
      </div>
      <div className="flex h-[350px] flex-col items-center justify-start gap-2">
        <Calendar mode="single" className="dark:text-gray-100" />
      </div>
    </div>
  );
};
