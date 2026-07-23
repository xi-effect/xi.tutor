import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { External, Redo, Trash } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';
import { useCancelLessonModal } from '../../../hooks';
import type { ScheduleLessonRow } from '../../types';
import { StartLessonButton } from 'features.lesson.start';
import { useLessonClassroomPresentation } from '../../../hooks/useLessonClassroomPresentation';
import { getScheduleLessonEndAt } from '../../../utils/getScheduleLessonEndAt';

export type NearestLessonCardProps = {
  lesson: ScheduleLessonRow;
  onReschedule?: () => void;
  /** Переопределяет переход на страницу расписания по кнопке внизу карточки */
  onScheduleNavigate?: () => void;
};

export const NearestLessonCard = ({
  lesson,
  onReschedule,
  onScheduleNavigate,
}: NearestLessonCardProps) => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const canCancelLesson = lesson.schedulerMeta != null && lesson.classroomId != null;
  const { setCancelModalOpen, cancelLessonModal } = useCancelLessonModal(lesson);
  const { classroomName, avatarUserId, subjectName } = useLessonClassroomPresentation({
    classroomId: lesson.classroomId,
    fallbackClassroomName: lesson.studentName,
    fallbackAvatarUserId: lesson.studentId,
  });

  const handleScheduleClick = () => {
    if (onScheduleNavigate) {
      onScheduleNavigate();
      return;
    }
    const filteredSearch = search.call ? { call: search.call } : {};
    navigate({
      to: '/schedule',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...filteredSearch,
      }),
    });
  };

  return (
    <div className="border-border-focus bg-background-surface relative flex w-full flex-col gap-4 rounded-2xl border-2 p-5">
      <div className="flex flex-row items-start justify-between gap-2">
        <h3 className="text-l-base text-text-primary font-medium">Ближайшее занятие</h3>
      </div>

      <div className="flex flex-row items-start gap-4">
        <div className="flex shrink-0 flex-col">
          <span className="text-xl-base text-text-primary font-normal">{lesson.startTime}</span>
          <span className="text-m-base text-text-secondary">{lesson.endTime}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {subjectName != null ? (
            <span className="text-xs-base text-text-secondary font-medium">{subjectName}</span>
          ) : null}
          <UserProfile userId={avatarUserId ?? lesson.studentId} text={classroomName} size="m" />
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        {lesson.classroomId != null && (
          <StartLessonButton
            classroomId={lesson.classroomId}
            scheduledAt={lesson.startAt}
            scheduledEndsAt={getScheduleLessonEndAt(lesson) ?? undefined}
            className="bg-status-info-background hover:bg-action-primary-background-disabled/50 h-[38px] flex-1 p-0"
          />
        )}
        <Button
          type="button"
          variant="none"
          size="s"
          className="bg-background-page text-text-secondary hover:bg-background-subtle hover:text-text-primary h-[38px] min-h-[38px] flex-1 p-0"
          onClick={onReschedule}
        >
          Перенести
          <Redo className="fill-icon-primary ml-2 h-4 w-4" />
        </Button>
        {canCancelLesson ? (
          <Button
            variant="none"
            size="s"
            className="bg-background-page absolute top-16 right-5 h-[38px] w-[38px] min-w-[38px] p-0"
            onClick={() => setCancelModalOpen(true)}
          >
            <Trash className="fill-icon-secondary h-5 w-5" />
          </Button>
        ) : null}
      </div>

      <div className="flex w-full justify-center">
        <Button
          type="button"
          variant="none"
          size="s"
          className="text-m-base text-text-secondary hover:text-text-primary inline-flex h-[36px] w-full cursor-pointer items-center gap-2 font-medium"
          onClick={handleScheduleClick}
        >
          Расписание
          <External className="fill-icon-secondary h-4 w-4" />
        </Button>
      </div>

      {cancelLessonModal}
    </div>
  );
};
