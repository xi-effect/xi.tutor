import { memo } from 'react';
import { cn } from '@xipkg/utils';

import { timeToString } from '../../../utils';
import { useOpenForm } from '../../../store/formEventStore';

import type { ICalendarEvent } from '../../types';

type CalendarEventProps = {
  event: ICalendarEvent;
  isPast?: boolean;
};

export const CalendarEvent = memo<CalendarEventProps>(({ event, isPast }) => {
  const handleOpenForm = useOpenForm();

  return (
    <div
      className={cn(
        'group hover:bg-background-page text-text-primary flex max-w-min cursor-pointer gap-1 rounded-sm',
        isPast && 'opacity-60',
      )}
      onClick={() => handleOpenForm(event)}
    >
      <div
        className={cn(
          'xs:block hidden w-1 min-w-1 rounded-[2px]',
          event.type === 'rest' && 'bg-status-success-accent',
          event.type === 'lesson' && 'bg-action-primary-background-default',
          event.isCancelled && 'bg-status-error-accent',
        )}
      />
      <div
        className={cn(
          event.type === 'lesson' && 'group-hover:text-text-link',
          event.type === 'rest' && 'group-hover:text-status-success-text',
          event.isCancelled && 'group-hover:text-text-danger',
        )}
      >
        <span className="mr-1 text-xs">{!event.isAllDay && timeToString(event.start)}</span>
        <span className="font-medium">{event.title}</span>
      </div>
    </div>
  );
});
