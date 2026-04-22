import { Button } from '@xipkg/button';
import { Clock, Edit, Redo, Trash } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  getScheduleLessonEndAt,
  type ScheduleLessonRow,
  StartLessonButton,
} from 'modules.calendar';
import { formatUpcomingDate } from './formatUpcomingDate';

type UpcomingLessonCardProps = {
  lesson: ScheduleLessonRow;
  classroomId: number;
  isNearest: boolean;
  onReschedule: () => void;
};

export const UpcomingLessonCard = ({
  lesson,
  classroomId,
  isNearest,
  onReschedule,
}: UpcomingLessonCardProps) => {
  const dateLabel = lesson.startAt ? formatUpcomingDate(lesson.startAt) : '—';
  const endAt = getScheduleLessonEndAt(lesson, lesson.startAt) ?? undefined;

  return (
    <div
      className={cn(
        'bg-gray-0 flex w-full max-w-[min(100%,400px)] min-w-[300px] flex-col gap-3 rounded-2xl p-4 sm:min-w-[320px]',
        isNearest ? 'border-brand-80 border-2' : 'border-gray-10 border',
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <span
          className={cn(
            'text-s-base min-w-0 font-medium first-letter:uppercase',
            isNearest ? 'text-brand-80' : 'text-gray-80',
          )}
        >
          {dateLabel}
        </span>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="none"
            size="s"
            className="text-gray-60 hover:text-gray-80 h-8 w-8 p-0"
            disabled
            title="Скоро"
            aria-label="Редактировать занятие (скоро)"
          >
            <Edit className="fill-gray-60 h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="none"
            size="s"
            className="text-gray-60 hover:text-gray-80 h-8 w-8 p-0"
            disabled
            title="Скоро"
            aria-label="Удалить занятие (скоро)"
          >
            <Trash className="fill-gray-60 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-gray-80 flex items-center gap-2 text-xs">
        <Clock className="fill-gray-60 h-3.5 w-3.5 shrink-0" />
        <span className="text-m-base font-medium tabular-nums">{lesson.startTime}</span>
        <div className="border-gray-20 min-w-0 flex-1 border-t" />
        <Clock className="fill-gray-60 h-3.5 w-3.5 shrink-0" />
        <span className="text-m-base font-medium tabular-nums">{lesson.endTime}</span>
      </div>

      <h3 className="text-m-base line-clamp-2 min-h-10 text-center font-semibold text-gray-100">
        {lesson.subject}
      </h3>

      <div className="mt-auto flex w-full min-w-0 flex-row gap-2">
        <div className="min-w-0 flex-1">
          <StartLessonButton
            classroomId={classroomId}
            scheduledAt={lesson.startAt}
            scheduledEndsAt={endAt}
            className={cn(
              'h-8 w-full border-0! p-0 shadow-none!',
              isNearest
                ? 'bg-brand-0 hover:bg-brand-20/50 text-brand-80'
                : 'hover:text-gray-70 bg-transparent! text-gray-50',
            )}
          />
        </div>
        <Button
          type="button"
          variant="none"
          size="s"
          className="text-gray-70 hover:text-gray-80 hover:bg-gray-10 h-8 min-w-0 flex-1 p-0"
          onClick={onReschedule}
        >
          <Redo className="fill-gray-70 mr-1 h-3.5 w-3.5 shrink-0" />
          <span className="text-s-base truncate">Перенести</span>
        </Button>
      </div>
    </div>
  );
};
