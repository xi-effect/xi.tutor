/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Button } from '@xipkg/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { useParams, useRouter } from '@tanstack/react-router';
import { AlarmClock, ArrowLeft, Edit, Maximize, Minimize } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  useCurrentUser,
  useGetClassroomMaterial,
  useGetClassroomMaterialStudent,
  useGetMaterial,
  useUpdateMaterial,
} from 'common.services';
import { Skeleton } from 'common.ui';
import { useMaterialActions } from 'features.materials.card';
import { ModalEditMaterialName } from 'features.materials.edit';
import { useFocusModeStore } from 'common.ui';
import { useEffect, useState } from 'react';
import { useYjsContext } from '../../../providers/YjsProvider';
import { stopEvent } from '../../../shapes/audio/constants';
import { CollaboratorAvatars } from './CollaboratorAvatars';
import { SettingsDropdown } from './SettingsDropdown';
import { unlockBoardTimerAudio } from './boardTimerAudio';
import { TimerDropdown } from './TimerDropdown';

export const Header = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openTimer, setOpenTimer] = useState(false);
  const { focusMode, setFocusMode, toggleFocusMode } = useFocusModeStore();

  const { classroomId, boardId, materialId } = useParams({ strict: false });

  // Сбрасываем режим фокуса при уходе со страницы доски
  useEffect(() => {
    return () => setFocusMode(false);
  }, [setFocusMode]);
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
    if (focusMode) setFocusMode(false);
    if (classroomId) {
      router.navigate({ to: '/classrooms/$classroomId', params: { classroomId } });
    } else {
      router.navigate({
        to: '/materials',
        // @ts-ignore
        search: { tab: 'boards' },
      });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  return (
    <>
      <div className="text-xl-base pointer-events-none absolute top-4 right-0 left-0 z-50 flex items-center justify-between px-4 pb-4 md:pl-8">
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
                    <h1 className="text-l-base xs:max-w-[150px] flex h-6 max-w-[100px] min-w-0 items-center pr-2 select-none md:max-w-[240px] lg:h-8">
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
        <div className="flex w-[172px] flex-col-reverse items-end gap-2 sm:w-auto sm:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <TimerDropdown open={openTimer} setOpen={setOpenTimer} />
          </div>
          <div className="bg-gray-0 border-gray-10 pointer-events-auto flex items-center justify-center gap-2 rounded-xl border p-1 pl-2 lg:rounded-2xl">
            {!isReadonly && <CollaboratorAvatars />}
            <Button
              variant="none"
              className={cn(
                'hover:bg-brand-0 flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl',
                openTimer && 'bg-brand-20/40 focus:bg-brand-20/40',
              )}
              data-umami-event="board-timer-menu"
              onPointerDown={stopEvent}
              onClick={(e) => {
                e.stopPropagation();
                unlockBoardTimerAudio();
                setOpenTimer((prev) => !prev);
              }}
            >
              <AlarmClock size="s" className="h-4 w-4 lg:h-6 lg:w-6" />
            </Button>
            <Button
              variant="none"
              onClick={toggleFocusMode}
              type="button"
              className="hover:bg-brand-0 flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
              data-umami-event="board-toggle-focus-mode"
              data-umami-event-state={focusMode ? 'exit' : 'enter'}
            >
              {focusMode ? (
                <Minimize size="s" className="h-4 w-4 lg:h-6 lg:w-6" />
              ) : (
                <Maximize size="s" className="h-4 w-4 lg:h-6 lg:w-6" />
              )}
            </Button>
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
