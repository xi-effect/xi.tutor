import { cn } from '@xipkg/utils';

import { timeToString } from '../../../utils';
import { useOpenForm } from '../../../store/formEventStore';

import { memo, type FC } from 'react';
import type { ICalendarEvent } from '../../types';

interface CalendarEventProps {
  event: ICalendarEvent;
  isPast?: boolean;
}

export const CalendarEvent: FC<CalendarEventProps> = memo(({ event, isPast }) => {
  const handleOpenForm = useOpenForm();

  return (
    <div
      className={cn(
        'group hover:bg-gray-5 text-gray-80 flex max-w-min cursor-pointer gap-1 rounded-sm',
        isPast && 'opacity-60',
      )}
      onClick={() => handleOpenForm(event)}
    >
      <div
        className={cn(
          'xs:block hidden w-1 min-w-1 rounded-[2px]',
          event.type === 'rest' && 'bg-green-80',
          event.type === 'lesson' && 'bg-brand-80',
          event.isCancelled && 'bg-red-80',
        )}
      />
      <div
        className={cn(
          event.type === 'lesson' && 'group-hover:text-brand-80',
          event.type === 'rest' && 'group-hover:text-green-80',
          event.isCancelled && 'group-hover:text-red-80',
        )}
      >
        <span className="mr-1 text-xs">{!event.isAllDay && timeToString(event.start)}</span>
        <span className="font-medium">{event.title}</span>
      </div>
    </div>
  );
});
