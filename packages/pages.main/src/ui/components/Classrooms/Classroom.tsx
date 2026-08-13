import { useState, type MouseEvent } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ClassroomT, IndividualClassroomT } from 'common.api';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { MoreVert } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { useCurrentUser, useDeleteClassroom, useUserByRole } from 'common.services';
import { ConfirmDialog } from 'common.ui';
import { StatusBadge, SubjectBadge } from 'features.classroom';
import { ModalEditClassroomName } from 'pages.classrooms';
import { StartLessonButton } from 'features.lesson.start';
import { useTranslation } from 'react-i18next';

type UserAvatarPropsT = {
  classroom: IndividualClassroomT;
  isLoading: boolean;
};

type RoleT = 'student' | 'tutor';

const avatarSize = 'l';

const UserAvatar = ({ isLoading, classroom }: UserAvatarPropsT) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

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
  const { t } = useTranslation('main');
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { deleteClassroom, isDeleting } = useDeleteClassroom();

  const [openEditModal, setOpenEditModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleClick = () => {
    const filteredSearch = (search as { call?: string }).call
      ? { call: (search as { call?: string }).call }
      : {};

    navigate({
      to: '/classrooms/$classroomId',
      params: { classroomId: classroom.id.toString() },
      search: {
        tab: 'overview',
        ...filteredSearch,
      },
    });
  };

  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteClassroom(
      { classroomId: classroom.id },
      { onSuccess: () => setDeleteConfirmOpen(false) },
    );
  };

  const handleOpenEditModal = (e: MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(false);
    setOpenEditModal(true);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="group bg-background-surface relative flex h-48 w-full cursor-pointer flex-col justify-between rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-linear hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.1)]"
        data-umami-event="classroom-open"
        data-umami-event-classroom-id={classroom.id}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
          }
        }}
        aria-label={t('classrooms.openClassroom')}
      >
        <div className="mr-8 flex min-w-0 items-center gap-2 overflow-hidden">
          <StatusBadge status={classroom.status} kind={classroom.kind} />
          {classroom.subject_id && (
            <SubjectBadge
              subjectId={classroom.subject_id}
              isTooltip
              className="overflow-hidden"
              textClassName="truncate max-w-full"
            />
          )}
        </div>

        <div className="flex flex-row items-center gap-2">
          {classroom.kind === 'individual' && (
            <UserAvatar classroom={classroom} isLoading={isLoading} />
          )}

          {classroom.kind === 'group' && (
            <div className="bg-action-primary-background-default text-text-on-accent flex size-12 shrink-0 items-center justify-center rounded-full">
              {classroom.name?.[0].toUpperCase() ?? ''}
            </div>
          )}

          <Tooltip delayDuration={2000}>
            <TooltipTrigger asChild>
              <div className="flex min-w-0 flex-1 flex-row items-center">
                <h3 className="text-s-base text-text-primary line-clamp-1 text-left font-medium">
                  {classroom.name}
                </h3>
              </div>
            </TooltipTrigger>
            <TooltipContent>{classroom.name}</TooltipContent>
          </Tooltip>
        </div>

        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <StartLessonButton
            classroomId={classroom.id}
            className="bg-status-info-background hover:bg-status-info-background/80 w-full rounded-lg"
          />
        </div>

        {isTutor ? (
          <div
            className="absolute top-5 right-5 flex h-7 w-7 items-center justify-center"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  className="hover:bg-background-subtle h-7 min-h-7 w-7 min-w-7 rounded-lg p-0"
                  variant="none"
                  size="icon"
                  aria-label={t('classrooms.menuAria')}
                >
                  <MoreVert className="fill-icon-secondary dark:fill-icon-primary h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="bottom"
                align="end"
                className="border-border-default bg-background-surface border p-1"
              >
                {classroom.kind === 'group' ? (
                  <DropdownMenuItem onClick={handleOpenEditModal} data-umami-event="classroom-edit">
                    {t('classrooms.rename')}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={handleDeleteClick}>
                  {t('classrooms.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </div>

      <ModalEditClassroomName
        name={classroom.name}
        open={openEditModal}
        classroomId={classroom.id}
        onClose={() => setOpenEditModal(false)}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('classrooms.deleteConfirm.title')}
        description={t('classrooms.deleteConfirm.description', { name: classroom.name })}
        confirmLabel={isDeleting ? t('classrooms.deleting') : t('classrooms.deleteConfirm.confirm')}
        cancelLabel={t('classrooms.deleteConfirm.cancel')}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </>
  );
};
