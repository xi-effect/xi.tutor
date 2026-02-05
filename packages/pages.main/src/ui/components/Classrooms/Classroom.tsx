import { useNavigate, useSearch } from '@tanstack/react-router';
import { ClassroomT, IndividualClassroomT } from 'common.api';
import { Button } from '@xipkg/button';
import { ArrowUpRight, Conference } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { useCurrentUser, useUserByRole, useGetParticipants } from 'common.services';
import { SubjectBadge } from 'features.classroom';

type UserAvatarPropsT = {
  classroom: IndividualClassroomT;
  isLoading: boolean;
};

type RoleT = 'student' | 'tutor';

const avatarSize = 'l';

const UserAvatar = ({ isLoading, classroom }: UserAvatarPropsT) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  // Используем useUserByRole с userId напрямую
  const userRole: RoleT = isTutor ? 'student' : 'tutor';
  const { data } = useUserByRole(userRole, classroom.tutor_id ?? classroom.student_id ?? 0);

  return (
    <Avatar size={avatarSize}>
      <AvatarImage
        src={`https://api.sovlium.ru/files/users/${classroom.tutor_id ?? classroom.student_id ?? 0}/avatar.webp`}
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

type ClassroomProps = {
  isLoading: boolean;
  classroom: ClassroomT;
};

export const Classroom = ({ classroom, isLoading }: ClassroomProps) => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const role: RoleT = isTutor ? 'tutor' : 'student';

  const { participants, isConferenceNotActive } = useGetParticipants(classroom.id.toString(), role);

  const isConferenceActive =
    !isConferenceNotActive && participants !== undefined && Array.isArray(participants);

  const handleClick = () => {
    // Сохраняем параметр call при переходе в кабинет
    const filteredSearch = search.call ? { call: search.call } : {};

    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId: classroom.id.toString() },
      search: {
        tab: 'overview',
        ...filteredSearch,
      },
    });
  };

  const handleStartLesson = () => {
    // Переходим на страницу кабинета с параметром goto=call
    const url = `/classrooms/${classroom.id}?goto=call`;
    window.location.href = url;
  };

  return (
    <div className="border-gray-30 relative flex min-h-[170px] max-w-[420px] min-w-[320px] flex-col items-start justify-start gap-4 rounded-2xl border bg-transparent px-6 py-4">
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            className="group bg-brand-0 absolute top-4 right-6 h-6 w-6 p-0"
            variant="icon"
            data-umami-event="classroom-open"
            data-umami-event-classroom-id={classroom.id}
          >
            <ArrowUpRight className="fill-brand-80 group-hover:fill-brand-100 h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Перейти в кабинет</TooltipContent>
      </Tooltip>

      <div className="flex h-6 w-full flex-row items-center">
        {classroom.subject_id && (
          <SubjectBadge
            subjectId={classroom.subject_id}
            isTooltip
            className="max-w-[calc(100%-40px)] overflow-hidden"
            textClassName="truncate max-w-full"
            size="s"
          />
        )}
      </div>

      <div className="flex flex-row gap-2">
        {classroom.kind === 'individual' && (
          <UserAvatar classroom={classroom} isLoading={isLoading} />
        )}

        {classroom.kind === 'group' && (
          <div className="bg-brand-80 text-gray-0 flex h-12 min-h-12 w-12 min-w-12 items-center justify-center rounded-3xl">
            {classroom.name?.[0].toUpperCase() ?? ''}
          </div>
        )}

        <Tooltip delayDuration={2000}>
          <TooltipTrigger asChild>
            <div className="flex h-full w-full flex-row items-center justify-center gap-2">
              <h3 className="text-s-base line-clamp-2 w-full text-left font-medium text-gray-100">
                {classroom.name}
              </h3>
            </div>
          </TooltipTrigger>
          <TooltipContent>{classroom.name}</TooltipContent>
        </Tooltip>
      </div>

      <Button
        size="s"
        variant="secondary"
        className="group mt-auto w-full"
        onClick={handleStartLesson}
        disabled={!isTutor && !isConferenceActive}
        data-umami-event={isTutor ? 'classroom-start-lesson' : 'classroom-join-lesson'}
        data-umami-event-classroom-id={classroom.id}
      >
        {isTutor ? 'Начать занятие' : 'Присоединиться'}
        <Conference className="group-hover:fill-gray-0 fill-brand-100 ml-2" />
      </Button>
    </div>
  );
};
