// import { Minimize, Maximize } from '@xipkg/icons';
// import { useFullScreen } from 'pkg.utils.client';
import { Button } from '@xipkg/button';

import { SettingsDropdown } from './SettingsDropdown';
import { useFullScreen } from 'common.utils';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetMaterial } from 'common.services';
import { ArrowLeft, Maximize, Minimize } from '@xipkg/icons';
import { Skeleton } from 'common.ui';
import { cn } from '@xipkg/utils';

export const Header = () => {
  const { isFullScreen, toggleFullScreen } = useFullScreen('whiteboard-container');
  const navigate = useNavigate();

  const params = useParams({ strict: false });
  const { data, isLoading } = useGetMaterial(params.boardId);

  const handleBack = () => {
    if (isFullScreen) toggleFullScreen();
    navigate({ to: '/materials' });
  };

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
            <h1 className="text-xl-base">{data.name}</h1>
          )}
        </div>
        <div className="flex items-center gap-1">
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
