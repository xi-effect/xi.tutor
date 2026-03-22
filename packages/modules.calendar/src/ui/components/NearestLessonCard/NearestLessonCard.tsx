import { Button } from '@xipkg/button';
import { Close, Conference, External, Redo } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';
import { useCancelLessonModal } from '../../../hooks';
import type { ScheduleLessonRow } from '../../types';

export type NearestLessonCardProps = {
  lesson: ScheduleLessonRow;
  onStartLesson?: () => void;
  onReschedule?: () => void;
  /** Ссылка «Расписание» внизу карточки */
  onScheduleNavigate?: () => void;
  onCancelOne?: (lesson: ScheduleLessonRow) => void;
  onCancelAll?: (lesson: ScheduleLessonRow) => void;
};

export const NearestLessonCard = ({
  lesson,
  onStartLesson,
  onReschedule,
  onScheduleNavigate,
  onCancelOne,
  onCancelAll,
}: NearestLessonCardProps) => {
  const { setCancelModalOpen, cancelLessonModal } = useCancelLessonModal(lesson, {
    onCancelOne,
    onCancelAll,
  });

  return (
    <div className="border-brand-80 bg-gray-0 relative flex w-full flex-col gap-4 rounded-2xl border-2 p-5">
      <div className="flex flex-row items-start justify-between gap-2">
        <h3 className="text-l-base font-medium text-gray-100">Ближайшее занятие</h3>
      </div>

      <div className="flex flex-row items-start gap-4">
        <div className="flex shrink-0 flex-col">
          <span className="text-xl-base font-normal text-gray-100">{lesson.startTime}</span>
          <span className="text-m-base text-gray-60">{lesson.endTime}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-xs-base text-gray-60 font-medium">{lesson.subject}</span>
          <UserProfile userId={lesson.studentId} text={lesson.studentName} size="m" />
        </div>
      </div>

      <div className="flex w-full flex-row gap-2">
        <Button
          type="button"
          variant="none"
          size="s"
          className="bg-gray-5 text-gray-70 hover:bg-gray-10 hover:text-gray-80 h-[38px] flex-1 p-0"
          onClick={onReschedule}
        >
          <Redo className="fill-gray-70 mr-1.5 h-4 w-4" />
          Перенести
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="s"
          className="text-brand-100 bg-brand-0 hover:bg-brand-20/50 h-[38px] flex-1 p-0"
          onClick={onStartLesson}
        >
          Начать занятие
          <Conference className="fill-brand-100 ml-1.5 h-4 w-4" />
        </Button>
        <Button
          variant="none"
          size="s"
          className="bg-gray-5 absolute top-16 right-5 h-[38px] w-[38px] min-w-[38px] p-0"
          onClick={() => setCancelModalOpen(true)}
        >
          <Close className="fill-gray-60 h-5 w-5" />
        </Button>
      </div>

      <div className="flex w-full justify-center">
        <Button
          type="button"
          variant="none"
          size="s"
          className="text-m-base text-gray-70 inline-flex h-[36px] w-full cursor-pointer items-center gap-1 font-medium hover:text-gray-100"
          onClick={onScheduleNavigate}
        >
          Расписание
          <External className="h-4 w-4" />
        </Button>
      </div>

      {cancelLessonModal}
    </div>
  );
};
