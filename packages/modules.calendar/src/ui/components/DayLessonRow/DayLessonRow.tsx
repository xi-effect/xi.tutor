import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';
import { useCancelLessonModal } from '../../../hooks';
import type { ScheduleLessonRow } from '../../types';
import { cn } from '@xipkg/utils';
import { StartLessonButton } from '../StartLessonButton';
import { useLessonClassroomPresentation } from '../../../hooks/useLessonClassroomPresentation';

type DayLessonRowProps = {
  lesson: ScheduleLessonRow;
  /** Показывать кнопки «Начать занятие», «Перенести», удалить. По умолчанию false */
  showActions?: boolean;
  /** Вызов при выборе «Отменить только это занятие» */
  onCancelOne?: (lesson: ScheduleLessonRow) => void;
  /** Вызов при выборе «Отменить все после этого» */
  onCancelAll?: (lesson: ScheduleLessonRow) => void;
};

export const DayLessonRow = ({
  lesson,
  showActions = false,
  onCancelOne,
  onCancelAll,
}: DayLessonRowProps) => {
  const { setCancelModalOpen, cancelLessonModal } = useCancelLessonModal(lesson, {
    onCancelOne,
    onCancelAll,
  });
  const { classroomName, avatarUserId, subjectName } = useLessonClassroomPresentation({
    classroomId: lesson.classroomId,
    fallbackClassroomName: lesson.studentName,
    fallbackAvatarUserId: lesson.studentId,
  });

  return (
    <div
      className={cn(
        'border-gray-10 relative flex flex-row items-start gap-4 border-b p-4 last:border-b-0',
        showActions && 'border-brand-80 rounded-2xl border',
      )}
    >
      <div className="flex shrink-0 flex-col">
        <span className="text-xl-base font-normal text-gray-100">{lesson.startTime}</span>
        <span className="text-m-base text-gray-60">{lesson.endTime}</span>
      </div>
      <div className="flex w-full flex-col justify-start gap-5">
        <div className="flex flex-col gap-2">
          {subjectName != null ? (
            <span className="text-xs-base text-gray-60 font-medium">{subjectName}</span>
          ) : null}
          <div className="flex flex-row items-center gap-2">
            <UserProfile userId={avatarUserId ?? lesson.studentId} text={classroomName} size="m" />
          </div>
        </div>
        {showActions && (
          <div className="flex shrink-0 flex-row items-center gap-2">
            {lesson.classroomId != null && (
              <StartLessonButton
                classroomId={lesson.classroomId}
                scheduledAt={lesson.startAt}
                className="text-xs-base-size px-0"
              />
            )}
            <Button
              variant="none"
              size="s"
              className="bg-gray-5 text-gray-70 hover:bg-gray-10 hover:text-gray-80 text-xs-base-size h-[32px] w-full px-0"
              onClick={() => {}}
            >
              Перенести занятие
            </Button>
            <Button
              variant="none"
              size="s"
              className="absolute top-6 right-4 h-[38px] w-[38px] min-w-[38px] p-0"
              onClick={() => setCancelModalOpen(true)}
            >
              <Close className="fill-gray-60 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {cancelLessonModal}
    </div>
  );
};
