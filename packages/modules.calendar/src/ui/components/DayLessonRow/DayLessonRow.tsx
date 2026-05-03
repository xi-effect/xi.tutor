import { useMemo, type KeyboardEvent } from 'react';
import { Button } from '@xipkg/button';
import { CornerUpRight, Edit05, Trash } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useCurrentUser } from 'common.services';
import { useCancelLessonModal, useChangeLessonModal } from '../../../hooks';
import { useDayLessonListMeta } from '../../contexts/DayLessonListMetaContext';
import type { ScheduleLessonRow } from '../../types';
import { cn } from '@xipkg/utils';
import { StartLessonButton } from 'features.lesson.start';
import { useLessonClassroomPresentation } from '../../../hooks/useLessonClassroomPresentation';
import { getScheduleLessonEndAt } from '../../../utils/getScheduleLessonEndAt';
import type { ChangeLessonFormData } from 'features.lesson.change';

const ACTIVATE_KEYS = new Set(['Enter', ' ']);

/**
 * Кастомное имя group — стили `group-hover/day-lesson:*` срабатывают только с hover этой карточки,
 * без конфликта с `group` у тултипов и вложенных UI.
 * Ниже `lg` (планшет/мобилка) иконки действий видны всегда; от `lg` — только по ховеру карточки.
 */
const gHover = {
  pr4: 'lg:group-hover/day-lesson:pr-4',
  pointer: 'lg:group-hover/day-lesson:pointer-events-auto',
  opacity: 'lg:group-hover/day-lesson:opacity-100',
} as const;

const TOOLTIP_OPEN_DELAY_MS = 1000;

function handleActivateKey(e: KeyboardEvent, action: () => void) {
  if (ACTIVATE_KEYS.has(e.key)) {
    e.preventDefault();
    action();
  }
}

type DayLessonRowProps = {
  lesson: ScheduleLessonRow;
  /** Показывать блок действий: «Начать занятие» и (для препода) иконки справа (ниже lg — всегда, от lg — по ховеру карточки). По умолчанию false */
  showActions?: boolean;
  /** Синяя рамка «предстоящее / текущее» — только у ближайшего к моменту просмотра занятия в списке */
  isNearestLesson?: boolean;
  /** Календарный день списка — для расчёта окончания слота, если нет `lesson.startAt` */
  lessonDay?: Date;
  onReschedule?: (lesson: ScheduleLessonRow) => void;
  onSaveLesson?: (lesson: ScheduleLessonRow, data: ChangeLessonFormData) => void;
};

export const DayLessonRow = ({
  lesson,
  showActions = false,
  isNearestLesson = false,
  lessonDay,
  onReschedule,
  onSaveLesson,
}: DayLessonRowProps) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const listMeta = useDayLessonListMeta();
  const showLessonDescription = listMeta?.showLessonDescription ?? false;
  const toggleLessonDescription = listMeta?.toggleLessonDescription;
  const canCancelLesson = lesson.schedulerMeta != null && lesson.classroomId != null;
  const { setCancelModalOpen, cancelLessonModal } = useCancelLessonModal(lesson);
  const { setChangeModalOpen, changeLessonModal } = useChangeLessonModal(lesson, {
    onSaveLesson,
  });
  const { classroomName, avatarUserId, subjectName } = useLessonClassroomPresentation({
    classroomId: lesson.classroomId,
    fallbackClassroomName: lesson.studentName,
    fallbackAvatarUserId: lesson.studentId,
  });
  const showTutorIconColumn = isTutor && showActions;
  const descriptionText = lesson.description?.trim();
  const handleToggleDescription = () => toggleLessonDescription?.();

  const scheduledEndsAt = useMemo(
    () => getScheduleLessonEndAt(lesson, lessonDay) ?? undefined,
    [lesson, lessonDay],
  );

  return (
    <div
      className={cn(
        'border-gray-10 relative flex min-h-[136px] shrink-0 flex-row items-stretch gap-4 overflow-hidden p-4 pb-3.5 transition-[padding] duration-200 ease-linear',
        showTutorIconColumn && 'group/day-lesson pr-14 lg:pr-4 lg:hover:pr-14',
        isNearestLesson ? 'border-brand-80 rounded-2xl border' : 'border-b last:border-b-0',
      )}
    >
      <div className="flex shrink-0 flex-col">
        <span className="text-xl-base font-normal text-gray-100">{lesson.startTime}</span>
        <span className="text-m-base text-gray-60">{lesson.endTime}</span>
      </div>
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
          <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-row items-stretch gap-0">
            <div
              role="button"
              tabIndex={0}
              onClick={handleToggleDescription}
              onKeyDown={(e) => handleActivateKey(e, handleToggleDescription)}
              className={cn(
                'flex min-h-0 w-full max-w-full min-w-0 flex-1 cursor-pointer flex-col justify-start gap-2 rounded-lg p-1 text-left text-gray-100 transition-[padding] duration-200 ease-linear',
                'focus-visible:ring-brand-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                // overflow только для блока с метой+аватаром; иначе ломаем line-clamp и режем по середине строки
                !showLessonDescription && 'overflow-hidden',
                showTutorIconColumn && ['pr-4 lg:pr-0', gHover.pr4],
              )}
            >
              {showLessonDescription ? (
                <div className="min-h-0 w-full max-w-full min-w-0 shrink text-left">
                  <p className="text-s-base text-gray-80 m-0 line-clamp-3 max-h-15 min-h-0 w-full min-w-0 leading-5 wrap-break-word text-ellipsis">
                    {descriptionText != null && descriptionText.length > 0
                      ? descriptionText
                      : 'Описание не указано.'}
                  </p>
                </div>
              ) : (
                <>
                  {subjectName != null ? (
                    <span className="text-xs-base text-gray-60 font-medium">{subjectName}</span>
                  ) : null}
                  <div className="flex w-full max-w-full min-w-0 flex-row items-center gap-2 overflow-hidden">
                    <UserProfile
                      className="w-full max-w-full! min-w-0"
                      userId={avatarUserId ?? lesson.studentId}
                      text={classroomName}
                      size="m"
                    />
                  </div>
                  {lesson.subject.trim() !== '' ? (
                    <p className="text-s-base text-gray-90 line-clamp-2 leading-snug font-semibold">
                      {lesson.subject}
                    </p>
                  ) : null}
                </>
              )}
            </div>
            {showTutorIconColumn && (
              <div
                className={cn(
                  'absolute top-1 right-[-40px] z-10 flex flex-col gap-1 transition-opacity duration-200',
                  'pointer-events-auto opacity-100',
                  'lg:pointer-events-none lg:opacity-0',
                  gHover.pointer,
                  gHover.opacity,
                )}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <Tooltip delayDuration={TOOLTIP_OPEN_DELAY_MS}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="none"
                      size="s"
                      className="bg-gray-0/80 hover:bg-gray-10 h-[32px] w-[32px] min-w-[32px] p-0"
                      onClick={() => onReschedule?.(lesson)}
                    >
                      <CornerUpRight className="text-gray-60 h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Перенести занятие</TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={TOOLTIP_OPEN_DELAY_MS}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="none"
                      size="s"
                      className="bg-gray-0/80 hover:bg-gray-10 h-[32px] w-[32px] min-w-[32px] p-0"
                      onClick={() => setChangeModalOpen(true)}
                    >
                      <Edit05 className="text-gray-60 h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Редактировать занятие</TooltipContent>
                </Tooltip>
                {canCancelLesson ? (
                  <Tooltip delayDuration={TOOLTIP_OPEN_DELAY_MS}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="none"
                        size="s"
                        className="bg-gray-0/80 hover:bg-gray-10 h-[32px] w-[32px] min-w-[32px] p-0"
                        onClick={() => setCancelModalOpen(true)}
                      >
                        <Trash className="fill-gray-60 h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Отменить занятие</TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            )}
          </div>
        </div>
        {showActions && lesson.classroomId != null && (
          <div className="mt-auto flex w-full shrink-0 flex-row items-center gap-2 pt-2">
            <StartLessonButton
              classroomId={lesson.classroomId}
              scheduledAt={lesson.startAt}
              scheduledEndsAt={scheduledEndsAt}
              className="w-full min-w-0 flex-1 px-0 text-[12px]"
            />
          </div>
        )}
      </div>

      {cancelLessonModal}
      {changeLessonModal}
    </div>
  );
};
