import { memo, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@xipkg/utils';
// import { Clock, Conference, Redo, Trash } from '@xipkg/icons';
import { Clock } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { UserProfile } from '@xipkg/userprofile';
import { timeToString } from '../../../utils';
// import { useDeleteEvent } from '../../../store/eventsStore';
import { CARD_MIN_WIDTH, CARD_MAX_WIDTH } from '../../../hooks/useKanbanColumns';
import type { ICalendarEvent } from '../../types';
// import { Button } from '@xipkg/button';
import { useLessonClassroomPresentation } from '../../../hooks/useLessonClassroomPresentation';

/** Строка «кабинет»: аватар как в `UserProfile`, подпись с `truncate` и Tooltip только при обрезке. */
function LessonCardClassroomLine({
  classroomName,
  userId,
}: {
  classroomName: string;
  userId: number;
}) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) return;

    const update = () => {
      setIsTruncated(el.scrollWidth > el.clientWidth + 1);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [classroomName]);

  return (
    <div className="flex w-full min-w-0 items-center gap-1.5">
      <UserProfile
        className="min-w-0 shrink-0"
        size="s"
        userId={userId}
        text={classroomName}
        withOutText
      />
      <Tooltip {...(!isTruncated ? { open: false } : {})}>
        <TooltipTrigger asChild>
          <span
            ref={labelRef}
            className="text-xs-base-size min-w-0 flex-1 truncate text-left leading-normal text-gray-100"
          >
            {classroomName}
          </span>
        </TooltipTrigger>
        <TooltipContent align="start" side="top" className="max-w-sm font-normal wrap-break-word">
          {classroomName}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

interface LessonCardProps {
  event: ICalendarEvent;
  isPast?: boolean;
  /** День колонки — сегодня (рамка brand вместо hover) */
  isToday?: boolean;
  /** На всю ширину контейнера (для мобильного списка по дням) */
  fullWidth?: boolean;
  /** Открыть модалку с подробностями занятия */
  onClick?: () => void;
}

export const LessonCard = memo<LessonCardProps>(({ event, isToday, fullWidth, onClick }) => {
  // const deleteEvent = useDeleteEvent();

  const startTime = event.isAllDay ? null : timeToString(new Date(event.start));
  const endTime = event.isAllDay ? null : timeToString(new Date(event.end));

  const teacherName = event.lessonInfo?.studentName ?? event.title;
  const teacherId = event.lessonInfo?.teacherId;
  const lessonTitle = event.lessonInfo?.description ?? event.title;
  const { classroomName, avatarUserId, subjectName } = useLessonClassroomPresentation({
    classroomId: event.lessonInfo?.classroomId,
    fallbackClassroomName: teacherName,
    fallbackAvatarUserId: teacherId,
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  // const handleDelete = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   deleteEvent(event.id);
  // };

  const todayBorder = isToday && !event.isCancelled;

  return (
    <div
      className={cn(
        'relative flex w-full flex-col rounded-2xl border p-5 transition-colors duration-300',
        'group-hover:bg-[rgb(15_15_17/0.02)]',
        todayBorder ? 'border-brand-80 bg-white' : 'border-gray-10 bg-white',
        event.type === 'rest' && 'bg-gray-5 dark:bg-gray-10',
        onClick && 'cursor-pointer',
      )}
      style={fullWidth ? { width: '100%' } : { minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex min-w-0 flex-col gap-2">
        {subjectName != null ? <span className="text-gray-40 text-xs">{subjectName}</span> : null}

        {/* Кабинет / участник (подпись не вылезает за карточку; при обрезке — Tooltip) */}
        <LessonCardClassroomLine
          classroomName={classroomName}
          userId={avatarUserId ?? teacherId ?? 0}
        />

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
    </div>
  );
});

LessonCard.displayName = 'LessonCard';
