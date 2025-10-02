// import { Minimize, Maximize } from '@xipkg/icons';
// import { useFullScreen } from 'pkg.utils.client';
import { Button } from '@xipkg/button';

import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Maximize, Minimize } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useGetMaterial } from 'common.services';
import { Skeleton } from 'common.ui';
import { useFullScreen } from 'common.utils';
import { useEffect } from 'react';
import { EditableTitle } from './EditableTitle';
import { SettingsDropdown } from './SettingsDropdown';
import { HotkeysHelp } from '../shared/HotkeysHelp';

export const Header = () => {
  const { isFullScreen, toggleFullScreen } = useFullScreen('whiteboard-container');
  const navigate = useNavigate();

  const { boardId = 'empty' } = useParams({ strict: false });
  const { data, isLoading } = useGetMaterial(boardId);

  const handleBack = () => {
    if (isFullScreen) toggleFullScreen();
    navigate({ to: '/materials' });
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
            <ArrowLeft size="s" />
          </Button>
          {isLoading ? (
            <Skeleton variant="text" className="h-6 w-24" />
          ) : (
            <EditableTitle title={data.name} materialId={boardId} />
          )}
        </div>
        <div className="flex items-center gap-1">
          <HotkeysHelp />
          <Button
            variant="ghost"
            onClick={toggleFullScreen}
            type="button"
            className="h-[40px] w-[40px] p-2"
          >
            {isFullScreen ? <Minimize size="s" /> : <Maximize size="s" />}
          </Button>
          <SettingsDropdown />
        </div>
      </div>
    </div>
  );
};
