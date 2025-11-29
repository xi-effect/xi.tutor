// import { Minimize, Maximize } from '@xipkg/icons';
// import { useFullScreen } from 'pkg.utils.client';
import { Button } from '@xipkg/button';

import { useParams, useRouter } from '@tanstack/react-router';
import { ArrowLeft, Maximize, Minimize } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  useCurrentUser,
  useGetClassroomMaterial,
  useGetClassroomMaterialStudent,
  useGetMaterial,
} from 'common.services';
import { Skeleton } from 'common.ui';
import { useFullScreen } from 'common.utils';
import { useEffect } from 'react';
import { EditableTitle } from './EditableTitle';
import { SettingsDropdown } from './SettingsDropdown';
import { HotkeysHelp } from '../shared/HotkeysHelp';
import { useYjsContext } from '../../../providers/YjsProvider';

export const Header = () => {
  const { isFullScreenSupported, isFullScreen, toggleFullScreen } =
    useFullScreen('whiteboard-container');
  const { classroomId, boardId, materialId } = useParams({ strict: false });
  const { isReadonly } = useYjsContext();

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

  const router = useRouter();

  const handleBack = () => {
    if (isFullScreen) toggleFullScreen();

    router.history.back();
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
    <div
      className={cn(
        'bg-gray-0 text-xl-base absolute z-50 w-full px-4 pb-4',
        isFullScreen && 'pt-4',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            onClick={handleBack}
            type="button"
            className="h-[40px] w-[40px] p-2"
          >
            <ArrowLeft size="s" className="size-6" />
          </Button>
          {isLoading ? (
            <Skeleton variant="text" className="h-6 w-24" />
          ) : (
            <EditableTitle title={material.name} materialId={materialIdValue} isTutor={isTutor} />
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isReadonly && <HotkeysHelp />}
          {isFullScreenSupported && (
            <Button
              variant="ghost"
              onClick={toggleFullScreen}
              type="button"
              className="h-10 w-10 p-2"
            >
              {isFullScreen ? (
                <Minimize size="s" className="size-6" />
              ) : (
                <Maximize size="s" className="size-6" />
              )}
            </Button>
          )}
          {!isReadonly && <SettingsDropdown />}
        </div>
      </div>
    </div>
  );
};
