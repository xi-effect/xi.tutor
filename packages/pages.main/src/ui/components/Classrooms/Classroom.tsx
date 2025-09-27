import { useNavigate } from '@tanstack/react-router';
import { ClassroomT } from 'common.api';
import { Button } from '@xipkg/button';
import { Arrow, Conference } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { useUserById } from 'common.services';
import { SubjectBadge } from './SubjectBadge';

type UserAvatarPropsT = {
  classroom: ClassroomT;
  isLoading: boolean;
  student_id: string;
};

const UserAvatar = ({ isLoading, student_id, classroom }: UserAvatarPropsT) => {
  const { data } = useUserById(student_id);

  return (
    <Avatar size={avatarSize}>
      <AvatarImage
        src={`https://api.sovlium.ru/files/users/${classroom.kind === 'individual' ? classroom.student_id : classroom.tutor_id}/avatar.webp`}
        alt="user avatar"
      />
      {isLoading || !data ? (
        <AvatarFallback size={avatarSize} loading />
      ) : (
        <AvatarFallback size={avatarSize}>{data?.display_name[0].toUpperCase()}</AvatarFallback>
      )}
    </Avatar>
  );
};

const avatarSize = 'l';

type ClassroomProps = {
  isLoading: boolean;
  classroom: ClassroomT;
};

export const Classroom = ({ classroom, isLoading }: ClassroomProps) => {
  const navigate = useNavigate();

  console.log('classroom', classroom);

  const handleClick = () => {
    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId: classroom.id.toString() },
      search: { tab: 'overview' },
    });
  };

  const handleStartLesson = () => {
    // Переходим на страницу кабинета с параметром goto=call
    const url = `/classrooms/${classroom.id}?goto=call`;
    window.location.href = url;
  };

  return (
    <div className="border-gray-30 relative flex min-h-[170px] w-[320px] flex-col items-start justify-start gap-1 rounded-2xl border bg-transparent p-4">
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            className="group bg-brand-0 absolute top-5 right-5 h-6 w-6 p-0"
            variant="icon"
          >
            <Arrow className="fill-brand-80 group-hover:fill-brand-100 h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Перейти в кабинет</TooltipContent>
      </Tooltip>

      {classroom.subject_id && <SubjectBadge subject_id={classroom.subject_id} />}

      <div className="flex flex-row gap-2">
        {classroom.kind === 'individual' && (
          <UserAvatar
            classroom={classroom}
            isLoading={isLoading}
            student_id={classroom.student_id?.toString()}
          />
        )}
        <div className="flex h-full w-full flex-row items-center justify-center gap-2">
          <h3 className="text-s-base line-clamp-2 w-full text-center font-medium text-gray-100">
            {classroom.name}
          </h3>
        </div>
      </div>

      <Button
        size="s"
        variant="secondary"
        className="group mt-auto w-full"
        onClick={handleStartLesson}
      >
        Начать занятие <Conference className="group-hover:fill-gray-0 fill-brand-100 ml-2" />
      </Button>
    </div>
  );
};
