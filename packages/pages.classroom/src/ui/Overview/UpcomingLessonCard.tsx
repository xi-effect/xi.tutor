import { Button } from '@xipkg/button';
import { Clock, CornerUpRight, Edit05, Trash } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { getDateLocale } from 'common.ui';
import {
  getScheduleLessonEndAt,
  type ScheduleLessonRow,
  StartLessonButton,
} from 'modules.calendar';
import { useTranslation } from 'react-i18next';
import { formatUpcomingDate } from './formatUpcomingDate';

type UpcomingLessonCardProps = {
  lesson: ScheduleLessonRow;
  classroomId: number;
  isNearest: boolean;
  onReschedule: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showActions?: boolean;
};

export const UpcomingLessonCard = ({
  lesson,
  classroomId,
  isNearest,
  onReschedule,
  onEdit,
  onDelete,
  showActions = true,
}: UpcomingLessonCardProps) => {
  const { t, i18n } = useTranslation('classroom');
  const dateLabel = lesson.startAt
    ? formatUpcomingDate(lesson.startAt, getDateLocale(i18n.language))
    : '—';
  const endAt = getScheduleLessonEndAt(lesson, lesson.startAt) ?? undefined;

  return (
    <div
      className={cn(
        'group/lesson-card bg-background-surface flex min-h-[220px] w-full max-w-[min(100%,400px)] min-w-[300px] flex-col gap-2 rounded-2xl border p-5 sm:min-w-[320px]',
        isNearest ? 'border-border-focus border-2' : 'border-border-default border',
      )}
    >
      <div className="relative flex h-4 w-full min-w-0 items-start justify-between gap-2">
        <span className="text-xs-base text-text-link min-w-0 font-medium first-letter:uppercase">
          {dateLabel}
        </span>
        {showActions ? (
          <div className="absolute top-[-16px] right-0 flex shrink-0 gap-1 opacity-0 transition-all duration-200 ease-linear group-hover/lesson-card:top-[-4px] group-hover/lesson-card:opacity-100">
            <Button
              type="button"
              variant="none"
              size="s"
              className="text-text-secondary hover:text-text-primary h-6 w-6 p-0"
              onClick={onReschedule}
              title={t('actions.reschedule')}
              aria-label={t('actions.rescheduleLesson')}
            >
              <CornerUpRight className="text-text-secondary h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="none"
              size="s"
              className="text-text-secondary hover:text-text-primary h-6 w-6 p-0"
              onClick={onEdit}
              aria-label={t('actions.editLesson')}
            >
              <Edit05 className="text-text-secondary h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="none"
              size="s"
              className="text-text-secondary hover:text-text-primary h-6 w-6 p-0"
              onClick={onDelete}
              aria-label={t('actions.deleteLesson')}
            >
              <Trash className="fill-icon-secondary h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>

      {/* Время как в ScheduleKanban/LessonCard: часы — линия — часы */}
      <div className="mt-2 flex w-full items-center gap-2">
        <div className="flex items-center gap-1">
          <Clock className="fill-icon-disabled h-4 w-4 shrink-0" />
          <span className="text-text-primary text-[14px] tabular-nums">{lesson.startTime}</span>
        </div>
        <span
          className="bg-background-subtle dark:bg-background-subtle h-px flex-1 shrink-0"
          aria-hidden
        />
        <div className="text-text-primary dark:text-text-primary flex items-center gap-1 text-sm">
          <Clock className="fill-icon-disabled h-4 w-4 shrink-0" />
          <span className="text-text-primary text-xs-base-size tabular-nums">{lesson.endTime}</span>
        </div>
      </div>

      <h3 className="text-text-primary mt-2 line-clamp-2 h-[40px] text-[14px] leading-snug font-semibold">
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
              ? 'bg-status-info-background hover:bg-action-primary-background-disabled/50 text-text-link'
              : 'hover:text-text-secondary text-text-muted bg-transparent!',
          )}
        />
      </div>
    </div>
  );
};
