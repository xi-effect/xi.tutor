import { Button } from '@xipkg/button';
import { Calendar } from '@xipkg/calendar';
import { useTranslation } from 'react-i18next';

export const Sidebar = () => {
  const { t } = useTranslation('calendar');

  return (
    <div className="border-gray-10 hidden h-full w-[320px] flex-col justify-between self-start border-l px-2 py-1 md:flex">
      <div>
        <Button className="mb-4 w-full">{t('add_event')}</Button>
        <p className="text-center">{t('pick_time')}</p>
      </div>
      <Calendar
        classNames={{
          months: 'sm:flex-col',
          month_caption: 'hidden',
          table: 'w-full border-collapse',
          head_row: 'grid grid-cols-7',
          row: 'grid grid-cols-7',
          cell: 'text-center p-2',
          day: 'rounded hover:bg-gray-200',
        }}
      />
    </div>
  );
};
