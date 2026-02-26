import { memo, useState } from 'react';
import { cn } from '@xipkg/utils';
import { Clock, Conference, Redo, Trash } from '@xipkg/icons';
import { timeToString } from '../../../utils';
import { useDeleteEvent } from '../../../store/eventsStore';
import { CARD_MIN_WIDTH, CARD_MAX_WIDTH } from '../../../hooks/useKanbanColumns';
import type { ICalendarEvent } from '../../types';

interface LessonCardProps {
  event: ICalendarEvent;
  isPast?: boolean;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const LessonCard = memo<LessonCardProps>(({ event, isPast }) => {
  const [hover, setHover] = useState(false);
  const deleteEvent = useDeleteEvent();

  const timeRange = event.isAllDay
    ? null
    : `${timeToString(new Date(event.start))} - ${timeToString(new Date(event.end))}`;

  const subject = event.lessonInfo?.subject ?? event.title;
  const teacherName = event.lessonInfo?.studentName ?? event.title;
  const topic = event.lessonInfo?.description ?? event.title;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteEvent(event.id);
  };

  return (
    <div
      className={cn(
        'group dark:bg-gray-95 relative flex w-full flex-col rounded-lg border bg-white px-3 py-2.5 shadow-sm transition-shadow',
        event.type === 'lesson' && 'border-gray-20 dark:border-gray-70',
        event.type === 'rest' && 'border-gray-20 bg-gray-5 dark:bg-gray-10 dark:border-gray-70',
        event.isCancelled && 'border-red-20 bg-red-5 dark:border-red-30 dark:bg-red-10 opacity-75',
        isPast && 'opacity-60',
        hover && 'ring-primary-30 ring-2',
      )}
      style={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="text-gray-90 mb-1 truncate text-sm font-semibold dark:text-gray-100">
        {subject}
      </div>
      <div className="mb-1 flex items-center gap-2">
        <div
          className="bg-gray-20 text-gray-70 dark:bg-gray-70 dark:text-gray-40 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium"
          aria-hidden
        >
          {getInitials(teacherName)}
        </div>
        <span className="text-gray-70 min-w-0 truncate text-xs dark:text-gray-50">
          {teacherName}
        </span>
      </div>
      <div className="text-gray-80 dark:text-gray-60 mb-1 truncate text-xs">{topic}</div>
      {timeRange && (
        <div className="text-gray-60 flex items-center gap-1 text-xs dark:text-gray-50">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{timeRange}</span>
        </div>
      )}

      <div
        className={cn(
          'border-gray-20 dark:border-gray-70 dark:bg-gray-95 flex items-center justify-end gap-1 rounded-b-lg border-t bg-white px-2 py-1.5 transition-opacity',
          hover ? 'opacity-100' : 'opacity-0',
        )}
      >
        <button
          type="button"
          className="text-gray-60 hover:text-primary-60 hover:bg-primary-5 dark:hover:bg-primary-10 flex h-8 w-8 items-center justify-center rounded-md transition-colors dark:text-gray-50"
          aria-label="Видеозвонок"
        >
          <Conference className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="text-gray-60 hover:text-primary-60 hover:bg-primary-5 dark:hover:bg-primary-10 flex h-8 w-8 items-center justify-center rounded-md transition-colors dark:text-gray-50"
          aria-label="Перенести"
        >
          <Redo className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="text-gray-60 hover:text-red-60 hover:bg-red-5 dark:hover:bg-red-10 flex h-8 w-8 items-center justify-center rounded-md transition-colors dark:text-gray-50"
          aria-label="Удалить"
          onClick={handleDelete}
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

LessonCard.displayName = 'LessonCard';
