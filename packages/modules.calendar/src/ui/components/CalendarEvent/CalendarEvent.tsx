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
    <div
      key={calendarEvent.id}
      className={cn(
        'group hover:bg-gray-5 flex cursor-pointer gap-1 rounded-sm',
        isPast && 'opacity-60',
      )}
    >
      <div
        className={cn(
          'xs:block hidden w-1 min-w-1 rounded-[2px]',
          calendarEvent.type === 'rest' && 'bg-green-80',
          calendarEvent.type === 'lesson' && 'bg-brand-80',
          calendarEvent.type === 'cancelled' && 'bg-red-80',
        )}
      />
      <div
        className={cn(
          calendarEvent.type === 'lesson' && 'group-hover:text-brand-80',
          calendarEvent.type === 'rest' && 'group-hover:text-green-80',
          calendarEvent.type === 'cancelled' && 'group-hover:text-red-80',
        )}
      >
        <span className="mr-1 text-xs">{timeToString(calendarEvent.start)}</span>
        <span className="font-medium">{calendarEvent.title}</span>
      </div>
    </div>
  );
};
