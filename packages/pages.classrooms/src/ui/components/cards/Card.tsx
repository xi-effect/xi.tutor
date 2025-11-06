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
import { useCurrentUser, useDeleteClassroom } from 'common.services';
import { useUserByRole } from 'features.table';

import { ClassroomPropsT } from '../../../types';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { SubjectBadge } from './SubjectBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';

type UserAvatarPropsT = {
  kind: string;
  student_id: string;
};

const avatarSize = 'l';

const UserAvatar = ({ student_id }: UserAvatarPropsT) => {
  const { data: currentUser } = useCurrentUser();
  const isTutor = currentUser?.default_layout === 'tutor';
  // Используем useUserByRole с userId напрямую
  const userRole = isTutor ? 'student' : 'tutor';
  const { data: user, isLoading } = useUserByRole(userRole, Number(student_id));

  return (
    <Avatar size={avatarSize}>
      <AvatarImage
        src={`https://api.sovlium.ru/files/users/${student_id}/avatar.webp`}
        alt="user avatar"
      />
      {isLoading ? (
        <AvatarFallback size={avatarSize} loading />
      ) : (
        <AvatarFallback size={avatarSize}>{user?.display_name[0].toUpperCase()}</AvatarFallback>
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
  const search = useSearch({ strict: false });
  const { deleteClassroom, isDeleting } = useDeleteClassroom();

  const handleClick = () => {
    // Сохраняем параметр call при переходе в кабинет
    const filteredSearch = search.call ? { call: search.call } : {};

    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId: id.toString() },
      search: {
        tab: 'overview',
        ...filteredSearch,
      },
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход на страницу класса
    deleteClassroom({ classroomId: id });
  };

  const { data: user } = useCurrentUser();

  const isTutor = user?.default_layout === 'tutor';

  return (
    <div
      onClick={handleClick}
      className="hover:bg-gray-5 border-gray-30 bg-gray-0 relative flex cursor-pointer justify-between rounded-2xl border p-4"
    >
      <div className="flex flex-col gap-4">
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
        <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center">
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
