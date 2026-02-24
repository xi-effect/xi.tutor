import { memo } from 'react';
import { cn } from '@xipkg/utils';
import { timeToString } from '../../../utils';
import type { ICalendarEvent } from '../../types';

interface LessonCardProps {
  event: ICalendarEvent;
  isPast?: boolean;
}

export const LessonCard = memo<LessonCardProps>(({ event, isPast }) => {
  const timeRange = event.isAllDay
    ? null
    : `${timeToString(new Date(event.start))} - ${timeToString(new Date(event.end))}`;

  return (
    <div
      className={cn(
        'w-full rounded-lg border px-3 py-2.5 shadow-sm',
        event.type === 'lesson' && 'border-gray-20 bg-green-5 dark:bg-green-10',
        event.type === 'rest' && 'border-gray-20 bg-gray-5 dark:bg-gray-10',
        event.isCancelled && 'border-red-20 bg-red-5 opacity-75',
        isPast && 'opacity-60',
      )}
    >
      {timeRange && (
        <div className="text-gray-60 mb-0.5 text-xs dark:text-gray-50">{timeRange}</div>
      )}
      <div className="text-gray-90 truncate font-medium dark:text-gray-100">{event.title}</div>
      {event.lessonInfo?.subject && (
        <div className="text-gray-60 mt-0.5 truncate text-xs dark:text-gray-50">
          {event.lessonInfo.subject}
        </div>
      )}
    </div>
  );
});

LessonCard.displayName = 'LessonCard';
