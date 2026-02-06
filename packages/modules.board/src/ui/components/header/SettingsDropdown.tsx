import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { File, Locked, MoreVert, Trash, Unlocked } from '@xipkg/icons';
import { useDropdownActions } from './hooks/useDropdownActions';
import { useFullScreen } from 'common.utils';
import { useMemo } from 'react';
import { useCurrentUser } from 'common.services';

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

  const portalContainer = useMemo(() => {
    return isFullScreen ? document.getElementById('whiteboard-container') : undefined;
  }, [isFullScreen]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-[40px] w-[40px] p-2"
          data-umami-event="board-settings-menu"
        >
          <MoreVert size="s" className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="flex w-[250px] flex-col gap-1 px-2 py-1"
        portalProps={{ container: portalContainer }}
      >
        <DropdownMenuGroup>
          <DownloadBoardAction onClick={saveCanvas} />

          {isTutor && !isReadonly && <ClearBoardAction onClick={clearBoard} />}

          {isTutor && <BlockBoardAction onClick={toggleReadonly} isReadonly={isReadonly} />}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
