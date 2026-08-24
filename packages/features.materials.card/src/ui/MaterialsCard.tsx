import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { accessModeStyles, formatToShortDate, formatUpdatedLabel } from '../utils';
import { cn } from '@xipkg/utils';
import { Badge } from '@xipkg/badge';
import { MaterialActionsMenu } from './MaterialActionsMenu';
import { useMaterialActions, useNavigateToMaterial } from '../hooks';
import { cardIcon } from './CardIcon';
import { AccessModeT, MaterialPropsT } from 'common.types';
import { useCurrentUser } from 'common.services';
import { ConfirmDialog, cardMenuPositionClass } from 'common.ui';
import { ModalEditMaterialName } from 'features.materials.edit';
import { useTranslation } from 'react-i18next';

type MaterialsCardProps = MaterialPropsT & {
  layout?: 'default' | 'compact' | 'gallery';
};

export const MaterialsCard = ({
  id,
  updated_at,
  name,
  content_kind,
  student_access_mode,
  classroom_id,
  onDuplicate,
  hasIcon = false,
  isLoading,
  className,
  layout = 'default',
}: MaterialsCardProps) => {
  const { t } = useTranslation('materialsCard');
  const { classroomId: routeClassroomId } = useParams({ strict: false });

  const materialClassroomId = classroom_id != null ? String(classroom_id) : undefined;
  const classroomId = routeClassroomId ?? materialClassroomId;
  const isClassroom = !!classroomId;

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const { navigateToMaterial } = useNavigateToMaterial();

  const {
    handleDelete,
    handleDeleteFromClassroom,
    handleUpdateAccessMode,
    handleUpdateName,
    isDeleting,
  } = useMaterialActions(id, content_kind, name, classroomId);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleCardClick = () => {
    if (modalOpen || deleteConfirmOpen) return;
    navigateToMaterial(id, content_kind, classroomId);
  };

  const handleDuplicate = () => {
    if (!onDuplicate) return;
    onDuplicate(id);
  };

  const handleAccessModeUpdate = (newMode: AccessModeT) => {
    handleUpdateAccessMode(newMode, student_access_mode);
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (isClassroom) {
      handleDeleteFromClassroom({ onSuccess: () => setDeleteConfirmOpen(false) });
      return;
    }
    handleDelete({ onSuccess: () => setDeleteConfirmOpen(false) });
  };

  const deleteTitle = isClassroom
    ? t('deleteConfirm.fromClassroomTitle')
    : content_kind === 'board'
      ? t('deleteConfirm.boardTitle')
      : t('deleteConfirm.noteTitle');

  const deleteDescription = isClassroom
    ? content_kind === 'board'
      ? t('deleteConfirm.fromClassroomBoardDescription', { name })
      : t('deleteConfirm.fromClassroomNoteDescription', { name })
    : content_kind === 'board'
      ? t('deleteConfirm.boardDescription', { name })
      : t('deleteConfirm.noteDescription', { name });

  const menu = isTutor && (
    <MaterialActionsMenu
      isClassroom={isClassroom}
      isTutor={isTutor}
      studentAccessMode={student_access_mode}
      onDelete={handleDeleteClick}
      onDeleteFromClassroom={handleDeleteClick}
      onUpdateAccessMode={handleAccessModeUpdate}
      onDuplicate={handleDuplicate}
      setModalOpen={setModalOpen}
    />
  );

  const editModal = (
    <ModalEditMaterialName
      isClassroom={isClassroom}
      isOpen={modalOpen}
      content_kind={content_kind}
      name={name}
      onClose={() => {
        setModalOpen(false);
      }}
      handleUpdateName={handleUpdateName}
    />
  );

  const deleteConfirmModal = (
    <ConfirmDialog
      open={deleteConfirmOpen}
      onOpenChange={setDeleteConfirmOpen}
      title={deleteTitle}
      description={deleteDescription}
      confirmLabel={isDeleting ? t('deleteConfirm.deleting') : t('deleteConfirm.confirm')}
      cancelLabel={t('deleteConfirm.cancel')}
      onConfirm={handleConfirmDelete}
      isPending={isDeleting}
    />
  );

  if (layout === 'compact') {
    return (
      <>
        <div
          onClick={handleCardClick}
          className={cn(
            'group hover:bg-background-page border-border-default bg-background-surface box-border flex min-h-[100px] min-w-[394px] flex-1 cursor-pointer flex-row items-start gap-4 rounded-2xl border p-4',
            className,
          )}
          data-umami-event="material-card-open"
          data-umami-event-type={content_kind}
        >
          {hasIcon && (
            <div className="size-6 shrink-0 [&>svg]:size-6">{cardIcon[content_kind]}</div>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden">
            <p className="text-text-primary truncate text-base leading-[22px] font-medium">
              {name}
            </p>
            <span className="text-text-secondary text-sm leading-5 font-normal">
              {t('changed', {
                date: isLoading ? '...' : updated_at ? formatToShortDate(updated_at) : '',
              })}
            </span>
          </div>
          {menu && (
            <div className="bg-background-surface flex size-8 shrink-0 items-center justify-center rounded-lg">
              {menu}
            </div>
          )}
        </div>
        {editModal}
        {deleteConfirmModal}
      </>
    );
  }

  if (layout === 'gallery') {
    const updatedLabel = isLoading ? '...' : updated_at ? formatUpdatedLabel(updated_at) : '';

    return (
      <>
        <div
          onClick={handleCardClick}
          className={cn(
            'group bg-background-surface relative flex h-40 w-full shrink-0 cursor-pointer flex-col justify-between gap-5 rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-linear hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.1)]',
            className,
          )}
          data-umami-event="material-card-open"
          data-umami-event-type={content_kind}
        >
          <div className="flex w-full items-center gap-2 pr-8">
            <div className="bg-status-info-background [&>svg]:fill-icon-brand flex size-10 shrink-0 items-center justify-center rounded-[10px]">
              {cardIcon[content_kind]}
            </div>

            {student_access_mode && (
              <Badge
                variant="default"
                className={cn(
                  'text-s-base min-w-0 truncate px-2 py-1 font-medium',
                  accessModeStyles[student_access_mode],
                )}
              >
                {t(`accessMode.${student_access_mode}`)}
              </Badge>
            )}
          </div>

          {isTutor && <div className={cardMenuPositionClass}>{menu}</div>}

          <div className="flex w-full flex-col items-start gap-1 overflow-hidden">
            <p className="text-text-primary line-clamp-2 w-full text-base leading-5 font-medium">
              {name}
            </p>
            <p className="text-text-secondary w-full text-sm leading-5 font-normal">
              {t('updatedGallery', { date: updatedLabel })}
            </p>
          </div>
        </div>
        {editModal}
        {deleteConfirmModal}
      </>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group hover:border-border-focus border-border-default bg-background-surface flex w-full shrink-0 cursor-pointer justify-between rounded-2xl border p-4 transition-all duration-200 ease-linear',
        className,
      )}
      data-umami-event="material-card-open"
      data-umami-event-type={content_kind}
    >
      <div className="flex flex-col gap-1 overflow-hidden">
        <div className="flex h-full flex-col justify-between gap-2">
          {student_access_mode && (
            <Badge
              variant="default"
              className={cn(
                'text-s-base px-2 py-1 font-medium',
                accessModeStyles[student_access_mode],
              )}
            >
              {t(`accessMode.${student_access_mode}`)}
            </Badge>
          )}

          <div className="text-l-base text-text-primary line-clamp-2 flex w-full items-center gap-2 font-medium">
            {hasIcon && cardIcon[content_kind]}
            <p className="truncate">{name}</p>
          </div>
          <div className="text-s-base text-text-secondary mt-2 font-normal">
            {t('updated', {
              date: isLoading ? '...' : updated_at ? formatToShortDate(updated_at) : '',
            })}
          </div>
        </div>
      </div>

      {isTutor && <div className="flex size-8 items-center justify-center">{menu}</div>}

      {editModal}
      {deleteConfirmModal}
    </div>
  );
};
