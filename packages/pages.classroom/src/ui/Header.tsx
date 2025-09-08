import { Badge } from '@xipkg/badge';
import { Telegram } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';
import { useParams } from '@tanstack/react-router';
import { useGetClassroom } from 'common.services';

export const Header = () => {
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));

  if (isLoading) {
    return (
      <div className="flex flex-row items-center pl-4">
        <div className="flex flex-col items-start gap-1">
          {/* UserProfile скелетон - точно как в реальном компоненте */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
          </div>
          {/* Предмет скелетон - точно как text-m-base */}
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="ml-auto flex flex-row items-center gap-2">
          {/* Badge статуса скелетон - размер m */}
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
          {/* Telegram badge скелетон - размер m */}
          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="flex flex-row items-center pl-4">
        <div className="flex flex-col items-start gap-1">
          <div className="text-m-base font-medium text-gray-100">Кабинет не найден</div>
        </div>
      </div>
    );
  }
  const handleTelegramClick = () => {
    // TODO: Получить реальный telegram username из данных пользователя
    window.open('https://t.me/nickname', '_blank');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Учится';
      case 'paused':
        return 'Приостановлено';
      case 'locked':
        return 'Заблокировано';
      case 'finished':
        return 'Завершено';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success' as const;
      case 'paused':
        return 'warning' as const;
      case 'locked':
        return 'destructive' as const;
      case 'finished':
        return 'secondary' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getDisplayName = () => {
    if (classroom.kind === 'individual') {
      return `${classroom.student.first_name} ${classroom.student.last_name}`;
    } else {
      return classroom.title;
    }
  };

  const getSubjectName = () => {
    return classroom.subject.name;
  };

  return (
    <div className="flex flex-row items-center pl-4">
      <div className="flex flex-col items-start gap-1">
        <UserProfile
          text={getDisplayName()}
          userId={classroom.kind === 'individual' ? classroom.student.id : classroom.id}
          size="l"
          classNameText="text-m-base font-medium text-gray-100 w-full line-clamp-1"
        />
        <div className="text-m-base text-gray-60 font-medium">{getSubjectName()}</div>
      </div>

      <div className="ml-auto flex flex-row items-center gap-2">
        <Badge variant={getStatusVariant(classroom.status)} size="m">
          {getStatusText(classroom.status)}
        </Badge>

        <Badge
          className="cursor-pointer"
          onClick={handleTelegramClick}
          variant="secondary"
          size="m"
        >
          <Telegram className="fill-brand-80 mr-2 size-4" />
          {`@nickname`}
        </Badge>
      </div>
    </div>
  );
};
