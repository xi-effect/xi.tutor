import { Button } from '@xipkg/button';
import { Clock, CornerUpRight, Edit05, Trash } from '@xipkg/icons';
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
        'group/lesson-card flex w-full max-w-[min(100%,400px)] min-w-[300px] flex-col gap-2 rounded-2xl border bg-white p-5 sm:min-w-[320px]',
        isNearest ? 'border-brand-80 border-2' : 'border-gray-10 border',
      )}
    >
      <div className="relative flex h-4 w-full min-w-0 items-start justify-between gap-2">
        <span className="text-xs-base text-brand-80 min-w-0 font-medium first-letter:uppercase">
          {dateLabel}
        </span>
        <div className="absolute top-[-16px] right-0 flex shrink-0 gap-1 opacity-0 transition-all duration-200 ease-linear group-hover/lesson-card:top-[-4px] group-hover/lesson-card:opacity-100">
          <Button
            type="button"
            variant="none"
            size="s"
            className="text-gray-60 hover:text-gray-80 h-6 w-6 p-0"
            onClick={onReschedule}
            title="Перенести"
            aria-label="Перенести занятие"
          >
            <CornerUpRight className="text-gray-60 h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="none"
            size="s"
            className="text-gray-60 hover:text-gray-80 h-6 w-6 p-0"
            title="Скоро"
            aria-label="Редактировать занятие"
          >
            <Edit05 className="text-gray-60 h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="none"
            size="s"
            className="text-gray-60 hover:text-gray-80 h-6 w-6 p-0"
            aria-label="Удалить занятие"
          >
            <Trash className="fill-gray-60 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Время как в ScheduleKanban/LessonCard: часы — линия — часы */}
      <div className="mt-2 flex w-full items-center gap-2">
        <div className="flex items-center gap-1">
          <Clock className="fill-gray-40 h-4 w-4 shrink-0" />
          <span className="text-gray-90 text-[14px] tabular-nums">{lesson.startTime}</span>
        </div>
        <span className="bg-gray-30 dark:bg-gray-60 h-px flex-1 shrink-0" aria-hidden />
        <div className="text-gray-90 flex items-center gap-1 text-sm dark:text-gray-100">
          <Clock className="fill-gray-40 h-4 w-4 shrink-0" />
          <span className="text-gray-90 text-xs-base-size tabular-nums">{lesson.endTime}</span>
        </div>
      </div>

      <h3 className="text-gray-90 mt-2 line-clamp-2 h-[40px] text-[14px] leading-snug font-semibold">
        {lesson.subject}
      </h3>

      <div className="mt-auto w-full min-w-0 pt-2">
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
    </div>
  );
};
