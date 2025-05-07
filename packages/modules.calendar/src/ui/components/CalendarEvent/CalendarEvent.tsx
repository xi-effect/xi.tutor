import { cn } from '@xipkg/utils';

import { timeToString } from '../../../utils';

import type { FC } from 'react';
import type { ICalendarEvent } from '../../types';

interface CalendarEventProps {
  calendarEvent: ICalendarEvent;
  isPast?: boolean;
}

export const CalendarEvent: FC<CalendarEventProps> = ({ calendarEvent, isPast }) => {
  return (
    <div key={calendarEvent.id} className={cn('flex cursor-pointer gap-1', isPast && 'opacity-60')}>
      <div
        className={cn(
          'xs:block hidden w-2 rounded-[8px]',
          calendarEvent.type === 'vacation' && 'bg-green-80',
          calendarEvent.type === 'task' && 'bg-brand-80',
          calendarEvent.type === 'cancelled' && 'bg-red-80',
        )}
      />
      <div
        className={cn(
          calendarEvent.type === 'task' && 'hover:text-brand-80',
          calendarEvent.type === 'vacation' && 'hover:text-green-80',
          calendarEvent.type === 'cancelled' && 'hover:text-red-80',
        )}
      >
        {calendarEvent.start && (
          <span className="mr-1 text-xs">{timeToString(calendarEvent.start)}</span>
        )}
        <span className="font-medium">{calendarEvent.title}</span>
      </div>
    </div>
  );
};
