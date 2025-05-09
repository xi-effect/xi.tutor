import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { cn } from '@xipkg/utils';

import { isCurrentMonth, isWeekend } from '../../../utils';

import type { FC } from 'react';
import type { CalendarProps } from '../../types';

export const YearCalendar: FC<CalendarProps<'year'>> = ({ days }) => {
  const { t } = useTranslation('calendar');

  const MONTHS = t('months').split(',');
  const WEEK_DAYS = t('week_days').split(',');

  return (
    <div className="grid grid-cols-4 gap-6">
      {days.map((month, monthIndex) => (
        <div key={MONTHS[monthIndex]} className="p-4">
          <div className="mb-2 text-sm font-semibold">{MONTHS[monthIndex]}</div>
          <div className="text-muted-foreground mb-1 grid grid-cols-7 text-center text-xs">
            {WEEK_DAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {month.map((day) => {
              const isOutOfMonth = !isCurrentMonth(day, monthIndex);
              const weekend = isWeekend(day);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'mx-auto flex h-6 w-6 items-center justify-center rounded-full text-center text-xs',
                    isOutOfMonth && 'text-gray-30',
                    weekend && 'text-red-80',
                    weekend && isOutOfMonth && 'text-red-60',
                  )}
                >
                  {`${format(day, 'd')}`}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
