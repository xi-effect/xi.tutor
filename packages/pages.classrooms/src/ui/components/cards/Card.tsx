import React, { useState } from 'react';

import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Edit, Flag, Group, MoreVert, PersonalData, Trash } from '@xipkg/icons';

import { useNavigate, useSearch } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useCurrentUser, useDeleteClassroom, useUpdateClassroomStatus } from 'common.services';
import { tryChangeClassroomStatus, useCanActivateClassroom } from 'common.subscription';
import {
  ConfirmDialog,
  CardTooltipContent,
  cardMenuButtonClass,
  cardTypeIconBoxClass,
  cardMenuCheckboxItemClass,
  cardMenuDeleteItemClass,
  cardMenuIconClass,
  cardMenuItemClass,
  cardMenuPositionClass,
  cardMenuSeparatorClass,
  cardMenuSubTriggerClass,
  cardMenuSurfaceClass,
} from 'common.ui';
import { StatusBadge, SubjectLabel } from 'features.classroom';
import { ModalEditClassroomName } from 'features.classroom.rename';
import { isClassroomOnPause, type ClassroomStatusT } from 'common.api';
import { useTranslation } from 'react-i18next';
import { cn } from '@xipkg/utils';
import { ClassroomPropsT } from '../../../types';

const CLASSROOM_STATUS_OPTIONS: Exclude<ClassroomStatusT, 'locked'>[] = [
  'active',
  'paused',
  'finished',
];

type UserAvatarPropsT = {
  student_id: string;
  name?: string | null;
};

const avatarSize = 'l';

const UserAvatar = ({ student_id, name }: UserAvatarPropsT) => {
  const letter = name?.trim()[0]?.toUpperCase() ?? '';

  return (
    <Avatar size={avatarSize}>
      <AvatarImage
        src={`https://api.sovlium.ru/files/users/${student_id}/avatar.webp`}
        alt="user avatar"
      />
      <AvatarFallback size={avatarSize}>{letter}</AvatarFallback>
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
  const { updateClassroomStatus, isUpdating: isUpdatingStatus } = useUpdateClassroomStatus();
  const canActivateClassroom = useCanActivateClassroom();
  const activateBlocked = status !== 'active' && !canActivateClassroom;

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

  const handleStatusChange = (nextStatus: ClassroomStatusT) => {
    if (!tryChangeClassroomStatus(status, nextStatus)) {
      return;
    }

    setDropdownOpen(false);
    updateClassroomStatus({ classroomId: id, status: nextStatus });
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const { data: user } = useCurrentUser();

  const isTutor = user?.default_layout === 'tutor';
  const isInactive = isClassroomOnPause(status);

  return (
    <div data-umami-event="classroom-card-open" data-umami-event-type={student_id}>
      <div
        data-classroom-id={id.toString()}
        onClick={handleClick}
        className="group bg-background-surface relative flex h-40 w-full cursor-pointer justify-between rounded-2xl p-5"
      >
        <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
          <div className="mr-8 flex min-w-0 items-center gap-2">
            <div className={cardTypeIconBoxClass}>
              {kind === 'group' ? (
                <Group aria-label={t('filters.group')} />
              ) : (
                <PersonalData aria-label={t('filters.individual')} />
              )}
            </div>
            <StatusBadge status={status} kind={kind} deleted={deleted} />
          </div>
          <div className="flex w-full min-w-0 flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
              {kind === 'individual' && (
                <UserAvatar student_id={student_id?.toString() ?? ''} name={name} />
              )}
              {kind === 'group' && (
                <div className="bg-action-primary-background-default text-text-on-accent flex size-12 shrink-0 items-center justify-center rounded-full">
                  {name?.[0]?.toUpperCase() ?? ''}
                </div>
              )}
              <Tooltip delayDuration={2000}>
                <TooltipTrigger asChild>
                  <h3 className="text-s-base text-text-primary line-clamp-2 min-w-0 flex-1 text-left font-medium">
                    {name}
                  </h3>
                </TooltipTrigger>
                <CardTooltipContent>{name}</CardTooltipContent>
              </Tooltip>
            </div>
            {subject_id ? <SubjectLabel subjectId={subject_id} /> : null}
          </div>
        </div>

        {isTutor && (
          <div
            className={cardMenuPositionClass}
            data-classroom-card-menu
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
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger
                    className={cardMenuSubTriggerClass}
                    onClick={(event) => event.stopPropagation()}
                    data-umami-event="classroom-change-status-open"
                  >
                    <Flag />
                    {t('changeStatus')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    sideOffset={8}
                    alignOffset={-4}
                    className={cn(cardMenuSurfaceClass, 'text-text-primary')}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {status === 'locked' ? (
                      <DropdownMenuCheckboxItem
                        checked
                        disabled
                        className={cardMenuCheckboxItemClass}
                      >
                        {t('status.locked')}
                      </DropdownMenuCheckboxItem>
                    ) : null}
                    {CLASSROOM_STATUS_OPTIONS.map((option) => {
                      const isActiveBlocked = option === 'active' && activateBlocked;
                      const item = (
                        <DropdownMenuCheckboxItem
                          key={option}
                          checked={status === option}
                          disabled={isUpdatingStatus || isActiveBlocked}
                          onCheckedChange={() => handleStatusChange(option)}
                          onClick={(event) => event.stopPropagation()}
                          className={cn(
                            cardMenuCheckboxItemClass,
                            status === option && 'bg-status-info-background text-text-link',
                          )}
                          data-umami-event="classroom-status-change"
                          data-umami-event-status={option}
                        >
                          {t(`status.${option}`)}
                        </DropdownMenuCheckboxItem>
                      );

                      if (!isActiveBlocked) {
                        return item;
                      }

                      return (
                        <Tooltip key={option}>
                          <TooltipTrigger asChild>
                            <div className="w-full">{item}</div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            className="z-[200] max-w-72 leading-5 font-normal"
                          >
                            {t('status.activeLimitTooltip')}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {isInactive ? null : (
                  <DropdownMenuItem
                    className={cardMenuItemClass}
                    onClick={handleOpenEditModal}
                    data-umami-event="classroom-edit"
                  >
                    <Edit />
                    {t('rename')}
                  </DropdownMenuItem>
                )}
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
