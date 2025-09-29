import React from 'react';

import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';

import { StatusBadge } from './StatusBadge';
import { useCurrentUser, useDeleteClassroom, useUserById } from 'common.services';

import { ClassroomPropsT } from '../../../types';
import { useNavigate } from '@tanstack/react-router';
import { SubjectBadge } from './SubjectBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';

type UserAvatarPropsT = {
  kind: string;
  student_id: string;
};

const avatarSize = 'l';

const UserAvatar = ({ student_id }: UserAvatarPropsT) => {
  const { data } = useUserById(student_id);

  return (
    <Avatar size={avatarSize}>
      <AvatarImage
        src={`https://api.sovlium.ru/files/users/${student_id}/avatar.webp`}
        alt="user avatar"
      />
      {!data ? (
        <AvatarFallback size={avatarSize} loading />
      ) : (
        <AvatarFallback size={avatarSize}>{data?.display_name[0].toUpperCase()}</AvatarFallback>
      )}
    </Avatar>
  );
};

export const Card: React.FC<ClassroomPropsT & { deleted?: boolean }> = ({
  id,
  name,
  status,
  kind,
  student_id,
  subject_id,
  deleted = false,
}) => {
  const navigate = useNavigate();
  const { deleteClassroom, isDeleting } = useDeleteClassroom();

  const handleClick = () => {
    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId: id.toString() },
      search: { tab: 'overview' },
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход на страницу класса
    console.log('handleDelete', id);
    deleteClassroom({ classroomId: id });
  };

  const { data: user } = useCurrentUser();

  const isTutor = user?.default_layout === 'tutor';

  return (
    <div
      onClick={handleClick}
      className="hover:bg-gray-5 border-gray-30 bg-gray-0 flex cursor-pointer justify-between rounded-2xl border p-4"
    >
      <div className="flex max-w-[350px] flex-col gap-4">
        <div className="flex flex-row gap-2">
          {kind === 'individual' && (
            <UserAvatar kind={kind} student_id={student_id?.toString() ?? ''} />
          )}
          {kind === 'group' && (
            <div className="bg-brand-80 text-gray-0 flex h-12 min-h-12 w-12 min-w-12 items-center justify-center rounded-[24px]">
              {name?.[0].toUpperCase() ?? ''}
            </div>
          )}
          <Tooltip delayDuration={2000}>
            <TooltipTrigger asChild>
              <div className="flex h-full w-full flex-row items-center justify-center gap-2">
                <h3 className="text-s-base line-clamp-2 w-full text-left font-medium text-gray-100">
                  {name}
                </h3>
              </div>
            </TooltipTrigger>
            <TooltipContent>{name}</TooltipContent>
          </Tooltip>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <StatusBadge status={status} kind={kind} deleted={deleted} />

          {/* <Badge size="m" className="text-gray-80 bg-gray-5 rounded-lg border-none px-2 py-1">
            {kind === 'individual' ? 'Индивидуальный' : 'Групповой'}
          </Badge> */}

          {subject_id && <SubjectBadge subject_id={subject_id} />}
        </div>
      </div>

      {isTutor && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-6 w-6" variant="ghost" size="icon">
                <MoreVert className="h-4 w-4 dark:fill-gray-100" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="bottom"
              align="end"
              className="border-gray-10 bg-gray-0 border p-1"
            >
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className={isDeleting ? 'cursor-not-allowed opacity-50' : ''}
              >
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
