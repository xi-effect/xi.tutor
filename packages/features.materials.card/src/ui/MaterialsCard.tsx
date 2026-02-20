import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { accessModeLabels, accessModeStyles, formatToShortDate } from '../utils';
import { cn } from '@xipkg/utils';
import { Badge } from '@xipkg/badge';
import { MaterialActionsMenu } from './MaterialActionsMenu';
import { useMaterialActions, useNavigateToMaterial } from '../hooks';
import { cardIcon } from './CardIcon';
import { AccessModeT, MaterialPropsT } from 'common.types';
import { useCurrentUser } from 'common.services';
import { ModalEditMaterialName } from 'features.materials.edit';

export const MaterialsCard = ({
  id,
  updated_at,
  name,
  content_kind,
  student_access_mode,
  onDuplicate,
  hasIcon = false,
  isLoading,
  className,
}: MaterialPropsT) => {
  const { classroomId } = useParams({ strict: false });

  const isClassroom = !!classroomId;

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const { navigateToMaterial } = useNavigateToMaterial();

  const { handleDelete, handleDeleteFromClassroom, handleUpdateAccessMode, handleUpdateName } =
    useMaterialActions(id, content_kind, name, classroomId);

  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = () => {
    if (modalOpen) return;
    navigateToMaterial(id, content_kind);
  };

  const handleDuplicate = () => {
    if (!onDuplicate) return;
    onDuplicate(id);
  };

  const handleAccessModeUpdate = (newMode: AccessModeT) => {
    handleUpdateAccessMode(newMode, student_access_mode);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'hover:bg-gray-5 border-gray-30 bg-gray-0 flex w-full shrink-0 cursor-pointer justify-between rounded-2xl border p-4',
        className,
      )}
      data-umami-event="material-card-open"
      data-umami-event-type={content_kind}
    >
      <div className="flex flex-col gap-1 overflow-hidden">
        <div className="flex h-full flex-col justify-between gap-2">
          {student_access_mode && accessModeLabels[student_access_mode] && (
            <Badge
              variant="default"
              className={cn(
                'text-s-base px-2 py-1 font-medium',
                accessModeStyles[student_access_mode],
              )}
            >
              {accessModeLabels[student_access_mode]}
            </Badge>
          )}

          <div className="text-l-base line-clamp-2 flex w-full items-center gap-2 font-medium text-gray-100">
            {hasIcon && cardIcon[content_kind]}
            <p className="truncate">{name}</p>
          </div>
          <div className="text-s-base text-gray-60 mt-2 font-normal">
            Обновлено: {isLoading ? '...' : updated_at ? formatToShortDate(updated_at) : ''}
          </div>
        </div>
      </div>

      {isTutor && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full">
          <MaterialActionsMenu
            isClassroom={isClassroom}
            isTutor={isTutor}
            studentAccessMode={student_access_mode}
            onDelete={handleDelete}
            onDeleteFromClassroom={handleDeleteFromClassroom}
            onUpdateAccessMode={handleAccessModeUpdate}
            onDuplicate={handleDuplicate}
            setModalOpen={setModalOpen}
          />
        </div>
      )}

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
    </div>
  );
};
