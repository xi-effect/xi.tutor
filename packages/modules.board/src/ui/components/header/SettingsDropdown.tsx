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

type ActionPropsT = {
  onClick: () => void;
};

const BlockBoardAction = ({ onClick, isReadonly }: ActionPropsT & { isReadonly: boolean }) => {
  return (
    <DropdownMenuItem className="flex gap-2 p-1" onClick={onClick}>
      {isReadonly ? <Unlocked /> : <Locked />}
      <span>{isReadonly ? 'Разблокировать доску' : 'Заблокировать доску'}</span>
    </DropdownMenuItem>
  );
};

const DownloadBoardAction = ({ onClick }: ActionPropsT) => {
  return (
    <DropdownMenuItem className="flex gap-2 p-1" onClick={onClick}>
      <File />
      <span>Скачать</span>
    </DropdownMenuItem>
  );
};

const ClearBoardAction = ({ onClick }: ActionPropsT) => {
  return (
    <DropdownMenuItem className="flex gap-2 p-1" onClick={onClick}>
      <Trash />
      <span>Очистить доску</span>
    </DropdownMenuItem>
  );
};

export const SettingsDropdown = () => {
  const { isReadonly, saveCanvas, clearBoard, toggleBoardLock } = useDropdownActions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-[40px] w-[40px] p-2">
          <MoreVert size="s" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex w-[250px] flex-col gap-1 px-2 py-1">
        <DropdownMenuGroup>
          <DownloadBoardAction onClick={saveCanvas} />

          <ClearBoardAction onClick={clearBoard} />

          <BlockBoardAction onClick={toggleBoardLock} isReadonly={isReadonly} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
