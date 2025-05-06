import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { cn } from '@xipkg/utils';

import { useEvents, useCalendar } from '../../../hooks';
import { getWeeksNumbers, isCurrentDay, isCurrentMonth, isWeekend } from '../../../utils';
import { CalendarEvent } from '../CalendarEvent/CalendarEvent';

import type { FC } from 'react';
import type { CalendarProps } from '../../types';

export const MonthCalendar: FC<CalendarProps<'month'>> = ({ days }) => {
  const { getDayEvents } = useEvents();
  const { currentDate } = useCalendar();
  const { t } = useTranslation('calendar');

  const WEEK_DAYS = t('week_days').split(',');

  return (
    <div className="flex text-sm">
      <div className="hidden flex-col items-center md:flex">
        <div className="w-7 text-center font-medium">Н</div>
        {getWeeksNumbers(days).map((weekNum) => (
          <div
            key={weekNum}
            className="border-gray-10 h-44 w-7 border-t border-b py-2.5 text-center text-xs"
          >
            {weekNum}
          </div>
        ))}
      </div>

      <div className="grid grow grid-cols-7">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="text-center font-medium">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <div key={day.toISOString()} className="border-gray-10 flex h-44 flex-col border p-1">
            <span
              className={cn(
                'px-2 py-1.5 text-right text-sm',
                isCurrentDay(day, currentDate) &&
                  'bg-brand-80 text-brand-0 w-fit self-end rounded-sm',
                !isCurrentMonth(day, currentDate.getMonth()) && 'text-gray-30',
                isWeekend(day) && 'text-red-80',
                isWeekend(day) && !isCurrentMonth(day, currentDate.getMonth()) && 'text-red-60',
              )}
            >
              {day.getDate() === 1
                ? `${format(day, 'LLLL')} ${format(day, 'd')}`
                : format(day, 'd')}
            </span>

            <div className="flex-1 space-y-0.5 overflow-y-auto">
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
