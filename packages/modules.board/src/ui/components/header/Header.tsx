import { Button } from '@xipkg/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
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

  const headerPadding = isFullScreen ? 'pt-4' : 'pt-0';

  return (
    <>
      <div
        className={cn(
          'text-xl-base pointer-events-none absolute top-4 right-0 left-0 z-50 flex items-center justify-between px-4 pb-4',
          headerPadding,
        )}
      >
        <div className="bg-gray-0 border-gray-10 pointer-events-auto flex items-center justify-center gap-2 rounded-xl border p-1 lg:rounded-2xl">
          <Button
            variant="none"
            onClick={handleBack}
            type="button"
            className="hover:bg-brand-0 flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
            data-umami-event="board-back"
          >
            <ArrowLeft size="s" className="h-4 w-4 lg:h-6 lg:w-6" />
          </Button>
          {isLoading ? (
            <Skeleton variant="text" className="h-6 w-24 lg:h-8" />
          ) : (
            <div className="flex min-w-0 items-center gap-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h1 className="text-l-base flex h-6 max-w-[200px] min-w-0 items-center pr-2 select-none sm:max-w-[220px] lg:h-8">
                      <span className="block min-w-0 truncate">{material?.name || 'Untitled'}</span>
                    </h1>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[360px] wrap-break-word">{material?.name || 'Untitled'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {isTutor && (
                <Button
                  type="button"
                  variant="none"
                  className="hover:bg-brand-0 flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
                  onClick={handleOpenModal}
                  data-umami-event="board-edit-name"
                >
                  <Edit size="s" className="h-4 w-4 lg:h-6 lg:w-6" />
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="bg-gray-0 border-gray-10 pointer-events-auto flex items-center justify-center gap-2 rounded-xl border p-1 pl-3 lg:rounded-2xl">
          {!isReadonly && <CollaboratorAvatars />}
          {isFullScreenSupported && (
            <Button
              variant="none"
              onClick={toggleFullScreen}
              type="button"
              className="hover:bg-brand-0 flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
              data-umami-event="board-toggle-fullscreen"
              data-umami-event-state={isFullScreen ? 'exit' : 'enter'}
            >
              {isFullScreen ? (
                <Minimize size="s" className="h-4 w-4 lg:h-6 lg:w-6" />
              ) : (
                <Maximize size="s" className="h-4 w-4 lg:h-6 lg:w-6" />
              )}
            </Button>
          )}
          <SettingsDropdown />
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
