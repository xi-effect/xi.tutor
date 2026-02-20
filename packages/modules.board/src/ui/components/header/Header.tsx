import { Button } from '@xipkg/button';

import { useParams, useRouter } from '@tanstack/react-router';
import { ArrowLeft, Edit, Maximize, Minimize } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  useCurrentUser,
  useGetClassroomMaterial,
  useGetClassroomMaterialStudent,
  useGetMaterial,
  useUpdateMaterial,
} from 'common.services';
import { Skeleton } from 'common.ui';
import { useFullScreen } from 'common.utils';
import { useMaterialActions } from 'features.materials.card';
import { ModalEditMaterialName } from 'features.materials.edit';
import { useEffect, useState } from 'react';
import { useYjsContext } from '../../../providers/YjsProvider';
import { HotkeysHelp } from '../shared/HotkeysHelp';
import { CollaboratorAvatars } from './CollaboratorAvatars';
import { SettingsDropdown } from './SettingsDropdown';

export const Header = () => {
  const [openModal, setOpenModal] = useState(false);

  const { isFullScreenSupported, isFullScreen, toggleFullScreen } =
    useFullScreen('whiteboard-container');
  const { classroomId, boardId, materialId } = useParams({ strict: false });
  const { isReadonly } = useYjsContext();

  const { updateMaterial } = useUpdateMaterial();

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const getMaterial = (() => {
    if (classroomId) {
      if (isTutor) {
        return useGetClassroomMaterial;
      } else {
        return useGetClassroomMaterialStudent;
      }
    }

    return useGetMaterial;
  })();

  const materialIdValue = boardId ?? materialId;
  if (!materialIdValue) {
    throw new Error('boardId or materialId must be provided');
  }

  const { data: material, isLoading } = getMaterial({
    classroomId: classroomId || '',
    id: materialIdValue,
  });

  const { handleUpdateName } = useMaterialActions(
    material?.id,
    material?.content_kind,
    material?.name,
    classroomId || '',
  );

  const router = useRouter();

  const handleBack = () => {
    if (isFullScreen) toggleFullScreen();

    router.history.back();
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Обработка событий от горячих клавиш
  useEffect(() => {
    const handleToggleFullscreen = () => {
      toggleFullScreen();
    };

    window.addEventListener('toggleFullscreen', handleToggleFullscreen);
    return () => {
      window.removeEventListener('toggleFullscreen', handleToggleFullscreen);
    };
  }, [toggleFullScreen]);

  return (
    <>
      <div
        className={cn(
          'bg-gray-0 text-xl-base absolute z-50 w-full px-4 pb-4',
          isFullScreen && 'pt-4',
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="none"
              onClick={handleBack}
              type="button"
              className="h-[40px] w-[40px] p-2"
              data-umami-event="board-back"
            >
              <ArrowLeft size="s" className="size-6" />
            </Button>
            {isLoading ? (
              <Skeleton variant="text" className="h-6 w-24" />
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl-base select-none">{material?.name || 'Untitled'}</h1>
                {isTutor && (
                  <Button
                    type="button"
                    variant="none"
                    className="h-10 w-10 p-2"
                    onClick={handleOpenModal}
                    data-umami-event="board-edit-name"
                  >
                    <Edit size="s" className="size-6" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isReadonly && (
              <>
                <CollaboratorAvatars />
                <HotkeysHelp />
              </>
            )}
            {isFullScreenSupported && (
              <Button
                variant="none"
                onClick={toggleFullScreen}
                type="button"
                className="h-10 w-10 p-2"
                data-umami-event="board-toggle-fullscreen"
                data-umami-event-state={isFullScreen ? 'exit' : 'enter'}
              >
                {isFullScreen ? (
                  <Minimize size="s" className="size-6" />
                ) : (
                  <Maximize size="s" className="size-6" />
                )}
              </Button>
            )}
            <SettingsDropdown />
          </div>
        </div>
      </div>

      {openModal && (
        <ModalEditMaterialName
          isOpen={openModal}
          name={material?.name}
          content_kind={material?.content_kind}
          isClassroom={!!classroomId}
          isLoading={updateMaterial.isPending}
          onClose={handleCloseModal}
          handleUpdateName={handleUpdateName}
        />
      )}
    </>
  );
};
