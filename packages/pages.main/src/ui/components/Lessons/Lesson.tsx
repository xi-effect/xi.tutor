import { Button } from '@xipkg/button';
import { Conference, Trash } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';

export type ScheduleLessonRow = {
  id: number;
  startTime: string;
  endTime: string;
  subject: string;
  studentName: string;
  studentId: number;
};

type LessonProps = {
  lesson: ScheduleLessonRow;
  showActions?: boolean;
};

export const Lesson = ({ lesson, showActions = false }: LessonProps) => {
  return (
    <div className="border-gray-10 flex w-full flex-row items-start gap-4 border-b py-6 last:border-b-0">
      <div className="flex shrink-0 flex-col">
        <span className="text-xl-base font-normal text-gray-100">{lesson.startTime}</span>
        <span className="text-m-base text-gray-60">{lesson.endTime}</span>
      </div>
      <div className="flex w-full flex-col justify-start gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs-base text-gray-60 font-medium">{lesson.subject}</span>
          <div className="flex flex-row items-center gap-2">
            <UserProfile userId={lesson.studentId} text={lesson.studentName} size="m" />
          </div>
        </div>
        {showActions && (
          <div className="flex shrink-0 flex-row items-center gap-2">
            <Button
              variant="ghost"
              size="s"
              className="text-brand-100 h-[38px] w-full"
              onClick={() => {}}
            >
              Начать занятие
              <Conference className="fill-brand-100 ml-1.5 h-4 w-4" />
            </Button>
            <Button
              variant="none"
              size="s"
              className="bg-gray-5 text-gray-70 hover:bg-gray-10 hover:text-gray-80 h-[38px] w-full"
              onClick={() => {}}
            >
              Перенести занятие
            </Button>
            <Button
              variant="none"
              size="s"
              className="h-[38px] w-[38px] min-w-[38px] p-0"
              onClick={() => {}}
            >
              <Trash className="fill-gray-60 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
