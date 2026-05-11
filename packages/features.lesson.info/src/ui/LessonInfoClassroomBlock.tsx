import type {
  ClassroomTutorResponseSchema,
  IndividualClassroomTutorResponseSchema,
} from 'common.api';
import { useCurrentUser, useUserByRole } from 'common.services';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import type { FC } from 'react';

const avatarSize = 'm';

function classroomHeadingText(data: ClassroomTutorResponseSchema): string {
  if (data.name != null && data.name.trim().length > 0) return data.name.trim();
  if (data.kind === 'group' && data.title.trim().length > 0) return data.title.trim();
  return '';
}

type LessonInfoUserAvatarProps = {
  classroom: IndividualClassroomTutorResponseSchema;
  isLoading: boolean;
};

const LessonInfoUserAvatar: FC<LessonInfoUserAvatarProps> = ({ classroom, isLoading }) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const userRole = isTutor ? 'student' : 'tutor';
  const userId = classroom.tutor_id ?? classroom.student_id ?? 0;
  const { data } = useUserByRole(userRole, userId);

  return (
    <Avatar size={avatarSize}>
      <AvatarImage src={`https://api.sovlium.ru/files/users/${userId}/avatar.webp`} alt="" />
      {isLoading || !data ? (
        <AvatarFallback size={avatarSize} loading />
      ) : (
        <AvatarFallback size={avatarSize}>
          {data.display_name[0]?.toUpperCase() ?? '?'}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export type LessonInfoClassroomBlockProps = {
  classroomId: number;
  classroom: ClassroomTutorResponseSchema | undefined;
  classroomLoading: boolean;
};

export const LessonInfoClassroomBlock: FC<LessonInfoClassroomBlockProps> = ({
  classroomId,
  classroom,
  classroomLoading,
}) => {
  if (classroomLoading) {
    return (
      <>
        <div className="flex min-h-0 w-full flex-row items-center">
          <span className="text-gray-40 text-xs-base">Загрузка кабинета…</span>
        </div>
        <div className="flex flex-row gap-2">
          <Avatar size={avatarSize}>
            <AvatarFallback size={avatarSize} loading />
          </Avatar>
          <div className="bg-gray-10 h-8 min-h-8 flex-1 animate-pulse rounded-lg" />
        </div>
      </>
    );
  }

  if (!classroom) {
    return (
      <div className="flex flex-row gap-2">
        <div className="bg-brand-80 text-gray-0 flex h-8 min-h-8 w-8 min-w-8 items-center justify-center rounded-3xl text-sm font-medium">
          №
        </div>
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <div className="flex h-8 min-w-0 flex-1 flex-row items-center">
              <h3 className="text-s-base line-clamp-2 text-left font-medium text-gray-100">
                Кабинет №{classroomId}
              </h3>
            </div>
          </TooltipTrigger>
          <TooltipContent>Кабинет №{classroomId}</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  const heading = classroomHeadingText(classroom);

  return (
    <>
      <div className="flex min-w-0 flex-row gap-2">
        {classroom.kind === 'individual' ? (
          <LessonInfoUserAvatar classroom={classroom} isLoading={false} />
        ) : (
          <div className="bg-brand-80 text-gray-0 flex h-8 min-h-8 w-8 min-w-8 shrink-0 items-center justify-center rounded-3xl">
            {(heading[0] ?? classroom.name?.[0] ?? classroom.title?.[0] ?? '').toUpperCase()}
          </div>
        )}

        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <div className="flex h-8 min-w-0 flex-1 flex-row items-center justify-start gap-2">
              <h3 className="text-s-base line-clamp-2 min-w-0 text-left font-medium text-gray-100">
                {heading || `Кабинет №${classroom.id}`}
              </h3>
            </div>
          </TooltipTrigger>
          <TooltipContent>{heading || `Кабинет №${classroom.id}`}</TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};
