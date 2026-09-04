import React, { useState } from 'react';

import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Edit, MoreVert, Trash } from '@xipkg/icons';

import { useNavigate, useSearch } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useCurrentUser, useDeleteClassroom, useUserByRole } from 'common.services';
import {
  ConfirmDialog,
  cardMenuButtonClass,
  cardMenuDeleteItemClass,
  cardMenuIconClass,
  cardMenuItemClass,
  cardMenuPositionClass,
  cardMenuSeparatorClass,
  cardMenuSurfaceClass,
} from 'common.ui';
import { StatusBadge, SubjectBadge } from 'features.classroom';
import { ModalEditClassroomName } from 'features.classroom.rename';
import { useTranslation } from 'react-i18next';
import { ClassroomPropsT } from '../../../types';

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
  const { t } = useTranslation('classrooms');
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { call?: string };
  const { deleteClassroom, isDeleting } = useDeleteClassroom();

  const [openEditModal, setOpenEditModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleClick = () => {
    // Сохраняем параметр call при переходе в кабинет
    const filteredSearch = search.call ? { call: search.call } : {};

    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId: id.toString() },
      search: {
        tab: 'boards',
        ...filteredSearch,
      },
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteClassroom({ classroomId: id }, { onSuccess: () => setDeleteConfirmOpen(false) });
  };

  const handleOpenEditModal = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход на страницу класса
    setDropdownOpen(false);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const { data: user } = useCurrentUser();

  const isTutor = user?.default_layout === 'tutor';

  return (
    <div data-umami-event="classroom-card-open" data-umami-event-type={student_id}>
      <div
        onClick={handleClick}
        className="group bg-background-surface relative flex h-40 w-full cursor-pointer justify-between rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-linear hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.1)]"
      >
        <div className="flex h-full max-w-full flex-col justify-between">
          <div className="mr-8 flex w-auto max-w-[calc(100%-32px)] items-center gap-2">
            <StatusBadge status={status} kind={kind} deleted={deleted} />

            {subject_id && (
              <SubjectBadge
                subjectId={subject_id}
                className="overflow-hidden"
                textClassName="truncate max-w-full"
                isTooltip
              />
            )}
          </div>
          <div className="flex flex-row items-center gap-2">
            {kind === 'individual' && (
              <UserAvatar kind={kind} student_id={student_id?.toString() ?? ''} />
            )}
            {kind === 'group' && (
              <div className="bg-action-primary-background-default text-text-on-accent flex size-12 shrink-0 items-center justify-center rounded-full">
                {name?.[0]?.toUpperCase() ?? ''}
              </div>
            )}
            <Tooltip delayDuration={2000}>
              <TooltipTrigger asChild>
                <div className="flex h-full w-full flex-row items-center justify-center gap-2">
                  <h3 className="text-s-base text-text-primary line-clamp-2 w-full text-left font-medium">
                    {name}
                  </h3>
                </div>
              </TooltipTrigger>
              <TooltipContent>{name}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {isTutor && (
          <div
            className={cardMenuPositionClass}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button className={cardMenuButtonClass} variant="none" size="icon">
                  <MoreVert className={cardMenuIconClass} />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="bottom"
                align="end"
                className={cardMenuSurfaceClass}
                onCloseAutoFocus={(event) => event.preventDefault()}
              >
                <DropdownMenuItem
                  className={cardMenuItemClass}
                  onClick={handleOpenEditModal}
                  data-umami-event="classroom-edit"
                >
                  <Edit />
                  {t('rename')}
                </DropdownMenuItem>
                <DropdownMenuSeparator className={cardMenuSeparatorClass} />
                <DropdownMenuItem
                  error
                  className={cardMenuDeleteItemClass}
                  onClick={handleDeleteClick}
                >
                  <Trash />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <ModalEditClassroomName
        kind={kind}
        name={name}
        open={openEditModal}
        classroomId={id}
        onClose={handleCloseEditModal}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('deleteConfirm.title')}
        description={t('deleteConfirm.description', { name })}
        confirmLabel={isDeleting ? t('deleting') : t('deleteConfirm.confirm')}
        cancelLabel={t('deleteConfirm.cancel')}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </div>
  );
};
