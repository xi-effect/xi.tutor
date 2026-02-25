import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { File, InfoCircle, Locked, MoreVert, Trash, Unlocked } from '@xipkg/icons';
import { useDropdownActions } from './hooks/useDropdownActions';
import { useFullScreen } from 'common.utils';
import { useEffect, useMemo, useState } from 'react';
import { useCurrentUser } from 'common.services';
import { HotkeysHelpModal } from '../shared/HotkeysHelp';

type ActionPropsT = {
  onClick: () => void;
};

const BlockBoardAction = ({ onClick, isReadonly }: ActionPropsT & { isReadonly: boolean }) => {
  return (
    <DropdownMenuItem
      className="flex gap-2 p-1"
      onClick={onClick}
      data-umami-event="board-toggle-lock"
      data-umami-event-state={isReadonly ? 'unlock' : 'lock'}
    >
      {isReadonly ? <Unlocked /> : <Locked />}
      <span>{isReadonly ? 'Разблокировать доску' : 'Заблокировать доску'}</span>
    </DropdownMenuItem>
  );
};

const DownloadBoardAction = ({ onClick }: ActionPropsT) => {
  return (
    <DropdownMenuItem
      className="flex gap-2 p-1"
      onClick={onClick}
      data-umami-event="board-download"
    >
      <File />
      <span>Скачать</span>
    </DropdownMenuItem>
  );
};

const ClearBoardAction = ({ onClick }: ActionPropsT) => {
  return (
    <DropdownMenuItem className="flex gap-2 p-1" onClick={onClick} data-umami-event="board-clear">
      <Trash />
      <span>Очистить доску</span>
    </DropdownMenuItem>
  );
};

export const SettingsDropdown = () => {
  const { isReadonly, saveCanvas, clearBoard, toggleReadonly } = useDropdownActions();
  const { isFullScreen } = useFullScreen('whiteboard-container');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const [hotkeysOpen, setHotkeysOpen] = useState(false);

  const portalContainer = useMemo(() => {
    return isFullScreen ? document.getElementById('whiteboard-container') : undefined;
  }, [isFullScreen]);

  useEffect(() => {
    const handleOpenHotkeysHelp = () => setHotkeysOpen(true);
    window.addEventListener('openHotkeysHelp', handleOpenHotkeysHelp);
    return () => window.removeEventListener('openHotkeysHelp', handleOpenHotkeysHelp);
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="none"
            className="hover:bg-brand-0 flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
            data-umami-event="board-settings-menu"
          >
            <MoreVert size="s" className="h-4 w-4 lg:h-6 lg:w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="flex w-[250px] flex-col gap-1 px-2 py-1"
          portalProps={{ container: portalContainer }}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="flex gap-2 p-1"
              onClick={() => setHotkeysOpen(true)}
              data-umami-event="board-hotkeys-help"
            >
              <InfoCircle />
              <span>Горячие клавиши</span>
            </DropdownMenuItem>
            <DownloadBoardAction onClick={saveCanvas} />

            {isTutor && !isReadonly && <ClearBoardAction onClick={clearBoard} />}

            {isTutor && <BlockBoardAction onClick={toggleReadonly} isReadonly={isReadonly} />}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <HotkeysHelpModal open={hotkeysOpen} onOpenChange={setHotkeysOpen} />
    </>
  );
};
