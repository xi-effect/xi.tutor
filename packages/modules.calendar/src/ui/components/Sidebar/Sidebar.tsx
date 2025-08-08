import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { Calendar } from '@xipkg/calendar';
import { EventForm } from '../EventForm/EventForm';

export const Sidebar = () => {
  const { t } = useTranslation('calendar');
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);

  return (
    <div className="border-gray-10 hidden h-full min-h-full w-[320px] flex-col justify-between gap-3 overflow-y-auto py-1 md:flex">
      {isEventFormOpen ? (
        <EventForm />
      ) : (
        <div>
          <Button
            className="mb-4 h-[40px] w-full rounded-xl"
            onClick={() => setIsEventFormOpen(true)}
          >
            {t('add_event')}
          </Button>
          <p className="text-center">{t('pick_time')}</p>
        </div>
      )}

      <div className="flex flex-col items-center justify-start gap-2">
        <Calendar mode="single" />
      </div>
    </div>
  );
};
