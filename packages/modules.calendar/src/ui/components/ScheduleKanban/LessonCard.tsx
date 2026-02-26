import { memo } from 'react';
import { cn } from '@xipkg/utils';
// import { Clock, Conference, Redo, Trash } from '@xipkg/icons';
import { Clock } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';
import { timeToString } from '../../../utils';
// import { useDeleteEvent } from '../../../store/eventsStore';
import { CARD_MIN_WIDTH, CARD_MAX_WIDTH } from '../../../hooks/useKanbanColumns';
import type { ICalendarEvent } from '../../types';
// import { Button } from '@xipkg/button';

interface LessonCardProps {
  event: ICalendarEvent;
  isPast?: boolean;
}

export const LessonCard = memo<LessonCardProps>(({ event }) => {
  // const deleteEvent = useDeleteEvent();

  const startTime = event.isAllDay ? null : timeToString(new Date(event.start));
  const endTime = event.isAllDay ? null : timeToString(new Date(event.end));

  const subject = event.lessonInfo?.subject ?? event.title;
  const teacherName = event.lessonInfo?.studentName ?? event.title;
  const teacherId = event.lessonInfo?.teacherId;
  const lessonTitle = event.lessonInfo?.description ?? event.title;

  // const handleDelete = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   deleteEvent(event.id);
  // };

  return (
    <div
      className={cn(
        'group border-gray-10 group-hover/day:border-brand-80 relative flex w-full flex-col rounded-2xl border bg-white p-5 transition-colors duration-300',
        event.type === 'rest' && 'bg-gray-5 dark:bg-gray-10',
        event.isCancelled && 'border-red-20 bg-red-5 opacity-75',
      )}
      style={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}
    >
      <div className="flex flex-col gap-2">
        {/* Предмет — мелкий серый тег */}
        <span className="text-gray-40 text-xs">{subject}</span>

        {/* Преподаватель */}
        <div className="flex items-center gap-2">
          <UserProfile size="s" userId={teacherId ?? 0} text={teacherName} />
        </div>

        {/* Название занятия — крупнее, может переноситься */}
        <p className="text-gray-90 mt-2 line-clamp-2 h-[40px] text-[14px] leading-snug font-semibold">
          {lessonTitle}
        </p>

        {/* Время: [часы] 11:00 — [линия] — [часы] 12:00 */}
        {startTime != null && endTime != null && (
          <div className="mt-2 flex w-full items-center gap-2">
            <div className="flex items-center gap-1">
              <Clock className="fill-gray-40 h-4 w-4 shrink-0" />
              <span className="text-gray-90 text-[14px]">{startTime}</span>
            </div>
            <span className="bg-gray-30 dark:bg-gray-60 h-px flex-1 shrink-0" aria-hidden />
            <div className="text-gray-90 flex items-center gap-1 text-sm dark:text-gray-100">
              <Clock className="fill-gray-40 h-4 w-4 shrink-0" />
              <span className="text-gray-90 text-xs-base-size">{endTime}</span>
            </div>
          </div>
        )}
      </div>

      {/* Действия при наведении */}
      {/* <div className={cn('mt-4 flex items-center justify-end gap-1 transition-opacity')}>
        <Button
          variant="none"
          type="button"
          className="flex h-8 w-full items-center justify-center rounded-md p-0"
          aria-label="Видеозвонок"
        >
          <Conference className="fill-brand-100 h-4 w-4" />
        </Button>
        <Button
          variant="none"
          type="button"
          className="flex h-8 w-full items-center justify-center rounded-md p-0"
          aria-label="Перенести"
        >
          <Redo className="fill-brand-100 h-4 w-4" />
        </Button>
        <Button
          variant="none"
          type="button"
          className="flex h-8 w-full items-center justify-center rounded-md p-0"
          aria-label="Удалить"
          onClick={handleDelete}
        >
          <Trash className="fill-brand-100 h-4 w-4" />
        </Button>
      </div> */}
    </div>
  );
});

LessonCard.displayName = 'LessonCard';
