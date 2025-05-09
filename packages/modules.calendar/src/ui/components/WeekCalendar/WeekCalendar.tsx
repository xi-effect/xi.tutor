import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { cn } from '@xipkg/utils';

import { useEvents } from '../../../hooks';
import { CalendarEvent } from '../CalendarEvent/CalendarEvent';

import type { FC } from 'react';
import { CalendarProps, type WeekOrDayMode } from '../../types';

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

interface WeekCalendarProps extends CalendarProps<WeekOrDayMode> {
  view: WeekOrDayMode;
}

export const WeekCalendar: FC<WeekCalendarProps> = ({ days, view }) => {
  const { getDayEvents } = useEvents();
  const { t } = useTranslation('calendar');

  const WEEK_DAYS = t('week_days').split(',');

  return (
    <div>
      <div
        className={cn(
          'grid w-full grid-cols-[repeat(7,_1fr)] pl-[80px]',
          view === 'day' && 'grid-cols-[1fr]',
        )}
      >
        {days.map((day, index) => (
          <div key={day.toISOString()} className="p-2 text-center text-xs">
            {`${WEEK_DAYS[index]} ${format(day, 'd')}`}
          </div>
        ))}
      </div>

      <div
        className={cn(
          'grid w-full grid-cols-[80px_repeat(7,_1fr)]',
          view === 'day' && 'grid-cols-[80px_1fr]',
        )}
      >
        <div className="flex flex-col pr-2 text-right text-xs">
          <div className="border-gray-10 h-10 w-20 border-y py-3 pr-2">Весь день</div>
          {hours.map((hour, index) => (
            <div key={hour} className="h-20 w-20 pr-2">
              <span className="relative top-[-6px] block">{index !== 0 && hour}</span>
            </div>
          ))}
        </div>

        {days.map((day) => {
          return (
            <div key={day.toISOString()} className="border-gray-10 flex flex-col border-l">
              <div className="border-gray-10 h-10 border-y p-1">
                {getDayEvents(day)
                  .filter((event) => !event.start)
                  .map((event) => (
                    <CalendarEvent calendarEvent={event} key={event.id} />
                  ))}
              </div>
              {hours.map((hour, index) => (
                <div key={hour} className="border-gray-10 h-20 border-b p-1">
                  {getDayEvents(day)
                    .filter((event) => event.start?.getHours() === index)
                    .map((event) => (
                      <CalendarEvent calendarEvent={event} key={event.id} />
                    ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
