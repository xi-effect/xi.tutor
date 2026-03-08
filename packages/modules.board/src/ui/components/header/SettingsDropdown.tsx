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
import { useEffect, useRef, useState } from 'react';
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
  const { isReadonly, saveCanvas, clearBoard, importBoardFromJson, toggleReadonly } =
    useDropdownActions();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const [hotkeysOpen, setHotkeysOpen] = useState(false);
  const [showImportOption, setShowImportOption] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpenHotkeysHelp = () => setHotkeysOpen(true);
    window.addEventListener('openHotkeysHelp', handleOpenHotkeysHelp);
    return () => window.removeEventListener('openHotkeysHelp', handleOpenHotkeysHelp);
  }, []);

  useEffect(() => {
    const handler = () => setShowImportOption(true);
    window.addEventListener('showBoardImportJson', handler);
    return () => window.removeEventListener('showBoardImportJson', handler);
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
        <DropdownMenuContent align="end" className="flex w-[250px] flex-col gap-1 px-2 py-1">
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
            {isTutor && !isReadonly && showImportOption && (
              <DropdownMenuItem
                className="flex gap-2 p-1"
                onClick={() => importInputRef.current?.click()}
                data-umami-event="board-import-json"
              >
                <File />
                <span>Импорт из JSON</span>
              </DropdownMenuItem>
            )}
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importBoardFromJson(file);
                e.target.value = '';
              }}
            />

            {isTutor && !isReadonly && <ClearBoardAction onClick={clearBoard} />}

            {isTutor && <BlockBoardAction onClick={toggleReadonly} isReadonly={isReadonly} />}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <HotkeysHelpModal open={hotkeysOpen} onOpenChange={setHotkeysOpen} />
    </>
  );
};
