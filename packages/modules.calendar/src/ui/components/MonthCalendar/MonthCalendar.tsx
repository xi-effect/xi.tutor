
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { cn } from '@xipkg/utils';

import { useEvents, useCalendar } from '../../../hooks';
import { 
  getWeeksNumbers,
  isCurrentDay, 
  isCurrentMonth, 
  isWeekend 
} from '../../../utils';
import { CalendarEvent } from '../CalendarEvent/CalendarEvent';

import type { FC } from 'react';
import type { CalendarProps } from '../../types';


export const MonthCalendar: FC<CalendarProps<'month'>> = ({ days }) => {
  const { getDayEvents } = useEvents();
  const { currentDate } = useCalendar();
  const { t } = useTranslation('calendar');

  const WEEK_DAYS = t('week_days').split(',');

  return (
    <div className="text-sm flex">
      <div className='hidden md:flex flex-col items-center'>

        <div className="w-7 text-center font-medium">Н</div>
          {getWeeksNumbers(days).map((weekNum) => (
            <div 
              key={weekNum}
              className='h-44 text-xs text-center py-2.5 w-7 border-t border-b border-gray-10'
            >
              {weekNum}
            </div>
          ))}
      </div>

      <div className="grow grid grid-cols-7">
        {WEEK_DAYS.map((day) => (
          <div key={day} className='text-center font-medium'>{day}</div>
        ))}
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className= "h-44 border border-gray-10 p-1 flex flex-col"
          >

            <span
              className={cn(
                "px-2 py-1.5 text-sm text-right",
                isCurrentDay(day, currentDate) && "w-fit self-end bg-brand-80 rounded-sm text-brand-0",
                !isCurrentMonth(day, currentDate.getMonth()) && "text-gray-30",
                isWeekend(day) && "text-red-80",
                isWeekend(day) && !isCurrentMonth(day, currentDate.getMonth()) && "text-red-60"
              )}
            >
              {day.getDate() === 1
                ? `${format(day, "LLLL")} ${format(day, "d")}`
                : format(day, "d")
              }
            </span>

            <div className="flex-1 overflow-y-auto space-y-0.5">
              {getDayEvents(day).map((event) => (
                <CalendarEvent calendarEvent={event} key={event.id} />
              ))}
            </div>
          </div>
        ))}         
      </div>

    </div>
  );
};


