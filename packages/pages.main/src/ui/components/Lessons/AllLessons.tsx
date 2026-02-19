import { Badge } from '@xipkg/badge';
import { UserProfile } from '@xipkg/userprofile';
import { Clock } from '@xipkg/icons';

export const AllLessons = () => {
  // TODO: Заменить на реальные данные из API
  const lessons = [
    {
      id: 1,
      time: '15:45 - 16:30',
      subject: 'Математика',
      studentName: 'Иван Петров',
      studentId: 2,
      isPaid: true,
    },
    {
      id: 2,
      time: '16:45 - 17:30',
      subject: 'Физика',
      studentName: 'Анна Кузнецова',
      studentId: 3,
      isPaid: false,
    },
    {
      id: 3,
      time: '17:45 - 18:30',
      subject: 'Химия',
      studentName: 'Олег Смирнов',
      studentId: 4,
      isPaid: true,
    },
    {
      id: 4,
      time: '19:45 - 20:30',
      subject: 'История',
      studentName: 'Елена Федорова',
      studentId: 5,
      isPaid: false,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className="bg-gray-0 border-gray-30 flex flex-row items-center gap-4 rounded-xl border p-4"
        >
          <div className="flex flex-col gap-1">
            <div className="text-s-base font-medium text-gray-100">{lesson.time}</div>
            <div className="text-m-base font-medium text-gray-100">{lesson.subject}</div>
          </div>
          <div className="ml-auto flex flex-row items-center gap-2">
            <UserProfile userId={lesson.studentId} text={lesson.studentName} size="s" />
            <Badge variant={lesson.isPaid ? 'default' : 'warning'} size="s" className="gap-1">
              <Clock className="h-3 w-3" />
              {lesson.isPaid ? 'оплачено' : 'ждёт оплату'}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};
