import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { ClassroomT, IndividualClassroomT } from 'common.api';
import { Button } from '@xipkg/button';
import { Account, Conference } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import {
  useCurrentUser,
  useUserByRole,
  useGetParticipantsByStudent,
  useGetParticipantsByTutor,
} from 'common.services';
import { SubjectBadge } from 'features.classroom';
import { cn } from '@xipkg/utils';
import { useCallStore } from 'modules.calls';

type UserAvatarPropsT = {
  classroom: IndividualClassroomT;
  isLoading: boolean;
};

type RoleT = 'student' | 'tutor';

const avatarSize = 'm';

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

const getButtonLabel = (
  isTutor: boolean,
  isConferenceNotActiveTutor: boolean,
  isCallActive: boolean,
) => {
  // Преподаватель и конференция не активна
  if (isTutor && isConferenceNotActiveTutor) return 'Начать занятие';
  if (isCallActive) return 'Вернутся в конференцию';

  return 'Присоединиться';
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

  const { isConferenceNotActive: isConferenceNotActiveStudent, isLoading: isLoadingStudent } =
    useGetParticipantsByStudent(classroom.id.toString(), isTutor);
  const { isConferenceNotActive: isConferenceNotActiveTutor, isLoading: isLoadingTutor } =
    useGetParticipantsByTutor(classroom.id.toString(), !isTutor);

  const searchCall = useSearch({ strict: false }) as { call?: string };
  const params = useParams({ strict: false }) as {
    callId?: string;
    classroomId?: string;
    boardId?: string;
  };
  const { call } = searchCall;
  const updateStore = useCallStore((state) => state.updateStore);

  const activeClassroom = useCallStore((state) => state.activeClassroom);
  const isStarted = useCallStore((state) => state.isStarted);
  const token = useCallStore((state) => state.token);

  const normalizedCallId = typeof call === 'string' ? call.replace(/^"|"$/g, '').trim() : undefined;

  const isCallActive = Boolean(isStarted && token && normalizedCallId === classroom.id.toString());

  const handleBackToRoom = () => {
    if (!token || !isStarted) {
      return;
    }

    const targetCallId =
      normalizedCallId ||
      activeClassroom ||
      params.classroomId ||
      params.callId ||
      classroom.id.toString();

    updateStore('localFullView', true);
    updateStore('mode', 'full');

    navigate({
      to: '/call/$callId',
      params: { callId: targetCallId },
      search: { call: targetCallId },
      replace: true,
    });
  };

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
    <div className="border-gray-30 relative flex min-h-[140px] w-[240px] flex-col items-start justify-start gap-3 rounded-2xl border bg-transparent px-5 py-4 xl:w-[280px]">
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            className="group hover:bg-brand-0 absolute top-4 right-6 h-8 w-10 rounded-md bg-transparent p-0"
            variant="icon"
            data-umami-event="classroom-open"
            data-umami-event-classroom-id={classroom.id}
          >
            <Account className="fill-gray-60 group-hover:fill-brand-100 h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Перейти в кабинет</TooltipContent>
      </Tooltip>

      <div className="flex h-4 w-full flex-row items-center">
        {classroom.subject_id && (
          <SubjectBadge
            subjectId={classroom.subject_id}
            isTooltip
            className="max-w-[calc(100%-40px)] overflow-hidden bg-transparent p-0"
            textClassName="truncate max-w-full text-gray-60"
            size="s"
          />
        )}
      </div>

      <div className="flex flex-row gap-2">
        {classroom.kind === 'individual' && (
          <UserAvatar classroom={classroom} isLoading={isLoading} />
        )}

        {classroom.kind === 'group' && (
          <div className="bg-brand-80 text-gray-0 flex h-8 min-h-8 w-8 min-w-8 items-center justify-center rounded-3xl">
            {classroom.name?.[0].toUpperCase() ?? ''}
          </div>
        )}

        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <div className="flex h-8 w-full flex-row items-center justify-start gap-2">
              <h3 className="text-s-base line-clamp-2 w-[80%] text-left font-medium text-gray-100">
                {classroom.name}
              </h3>
            </div>
          </TooltipTrigger>
          <TooltipContent>{classroom.name}</TooltipContent>
        </Tooltip>
      </div>

      {isLoadingStudent || isLoadingTutor ? (
        <Button size="s" className="group mt-auto h-[32px] w-full" disabled loading />
      ) : (
        <Button
          size="s"
          variant="ghost"
          className="text-brand-80 group hover:text-brand-100 mt-auto h-[32px] w-full"
          onClick={isCallActive ? handleBackToRoom : handleStartLesson}
          disabled={!isTutor && isConferenceNotActiveStudent}
          data-umami-event={isTutor ? 'classroom-start-lesson' : 'classroom-join-lesson'}
          data-umami-event-classroom-id={classroom.id}
        >
          {getButtonLabel(isTutor, isConferenceNotActiveTutor, isCallActive)}
          <Conference
            className={cn(
              'group-hover:fill-brand-100 fill-brand-80 ml-2',
              !isTutor && isConferenceNotActiveStudent && 'fill-gray-40',
            )}
          />
        </Button>
      )}
    </div>
  );
};
