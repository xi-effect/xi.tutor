import { Badge } from '@xipkg/badge';
import { Button } from '@xipkg/button';
import { UserProfile } from '@xipkg/userprofile';
import { Conference } from '@xipkg/icons';

export const NextLesson = () => {
  // TODO: Заменить на реальные данные из API
  const lesson = {
    id: 1,
    time: '14:45 - 15:30',
    subject: 'Английский язык',
    studentName: 'Мария Сидорова',
    studentId: 1,
    isPaid: true,
  };

  return (
    <div className="bg-gray-0 border-gray-30 flex flex-col gap-4 rounded-2xl border p-6">
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-s-base font-medium text-gray-100">{lesson.time}</div>
          <div className="text-l-base font-medium text-gray-100">{lesson.subject}</div>
        </div>
        <Badge variant={lesson.isPaid ? 'success' : 'warning'} size="s">
          {lesson.isPaid ? 'оплачен' : 'ждёт оплату'}
        </Badge>
      </div>

      <div className="flex flex-row items-center gap-2">
        <UserProfile userId={lesson.studentId} text={lesson.studentName} size="m" />
      </div>

      <div className="flex flex-row gap-2">
        <Button variant="none" size="s" className="border-gray-30 flex-1 rounded-lg border">
          Перенести занятие
        </Button>
        <Button variant="secondary" size="s" className="flex-1 rounded-lg">
          Начать занятие
          <Conference className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
