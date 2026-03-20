import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import {
  Check,
  Cursor,
  File,
  InfoCircle,
  Locked,
  MoreVert,
  Pen,
  Trash,
  Unlocked,
} from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useDropdownActions } from './hooks/useDropdownActions';
import { useEffect, useRef, useState } from 'react';
import { useCurrentUser } from 'common.services';
import { toast } from 'sonner';
import { useEditor } from 'tldraw';
import type { InputMode } from '../../../store/useTldrawStore';
import { useTldrawStore } from '../../../store';
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

const INPUT_MODE_OPTIONS: { value: InputMode; label: string; icon: React.ReactNode }[] = [
  { value: 'auto', label: 'Авто (по устройству)', icon: null },
  { value: 'pen', label: 'Перо', icon: <Pen /> },
  { value: 'mouse', label: 'Мышь', icon: <Cursor /> },
];

const BOARD_ELEMENTS_LIMIT = 4000;
const BOARD_ELEMENTS_WARNING_THRESHOLD = 3000;

export const SettingsDropdown = () => {
  const editor = useEditor();
  const { inputMode, setInputMode } = useTldrawStore();
  const { isReadonly, saveCanvas, clearBoard, toggleReadonly, importBoardFromJson } =
    useDropdownActions();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hotkeysOpen, setHotkeysOpen] = useState(false);
  const [showImportOption, setShowImportOption] = useState(false);
  const [elementsCount, setElementsCount] = useState(0);
  const importInputRef = useRef<HTMLInputElement>(null);
  const shownWarningToastRef = useRef(false);
  const shownLimitToastRef = useRef(false);

  const progressPercent = Math.min((elementsCount / BOARD_ELEMENTS_LIMIT) * 100, 100);
  const isWarningZone = elementsCount >= BOARD_ELEMENTS_WARNING_THRESHOLD;
  const isLimitReached = elementsCount >= BOARD_ELEMENTS_LIMIT;

  const handleOpenHotkeysHelp = (open: boolean) => {
    if (open) {
      setDropdownOpen(false);
      setHotkeysOpen(true);
    } else {
      setHotkeysOpen(false);
    }
  };

  useEffect(() => {
    const handleOpenHotkeysHelp = () => {
      setDropdownOpen(false);
      setHotkeysOpen(true);
    };
    window.addEventListener('openHotkeysHelp', handleOpenHotkeysHelp);
    return () => window.removeEventListener('openHotkeysHelp', handleOpenHotkeysHelp);
  }, []);

  useEffect(() => {
    const handler = () => setShowImportOption(true);
    window.addEventListener('showBoardImportJson', handler);
    return () => window.removeEventListener('showBoardImportJson', handler);
  }, []);

  useEffect(() => {
    if (!editor) return;
    const updateCount = () => setElementsCount(editor.getCurrentPageShapeIds().size);
    updateCount();
    return editor.store.listen(updateCount);
  }, [editor]);

  useEffect(() => {
    if (elementsCount >= BOARD_ELEMENTS_LIMIT) {
      if (!shownLimitToastRef.current) {
        toast.error('Место на доске закончилось', {
          description: `Достигнут лимит в ${BOARD_ELEMENTS_LIMIT} элементов.`,
          duration: 6000,
        });
        shownLimitToastRef.current = true;
      }
      shownWarningToastRef.current = true;
      return;
    }

    if (elementsCount >= BOARD_ELEMENTS_WARNING_THRESHOLD) {
      if (!shownWarningToastRef.current) {
        toast.info('Доска почти заполнена', {
          description: `На доске уже ${elementsCount} элементов из ${BOARD_ELEMENTS_LIMIT}.`,
          duration: 6000,
        });
        shownWarningToastRef.current = true;
      }
      shownLimitToastRef.current = false;
      return;
    }

    shownWarningToastRef.current = false;
    shownLimitToastRef.current = false;
  }, [elementsCount]);

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="none"
            className="hover:bg-brand-0 flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
            data-umami-event="board-settings-menu"
          >
            <MoreVert size="s" className="h-4 w-4 lg:h-6 lg:w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-100 flex w-[250px] flex-col gap-1 px-2 py-1">
          <div className="bg-brand-0/40 mb-1 rounded-lg px-2 py-2">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-gray-80">Заполнение доски</span>
              <span className={cn('font-medium', isLimitReached && 'text-red-60')}>
                {elementsCount} / {BOARD_ELEMENTS_LIMIT}
              </span>
            </div>
            <div className="bg-gray-10 h-2 w-full overflow-hidden rounded-full">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  isLimitReached ? 'bg-red-60' : isWarningZone ? 'bg-orange-60' : 'bg-brand-60',
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="flex gap-2 p-1"
              onClick={() => handleOpenHotkeysHelp(true)}
              data-umami-event="board-hotkeys-help"
            >
              <InfoCircle />
              <span>Горячие клавиши</span>
            </DropdownMenuItem>
            {editor && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex gap-2 p-1">
                  <Pen />
                  <span>Режим ввода</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="z-100 w-[250px]">
                  {INPUT_MODE_OPTIONS.map(({ value, label, icon }) => (
                    <DropdownMenuItem
                      key={value}
                      className="flex gap-2 p-1"
                      onClick={() => {
                        setInputMode(value);
                        if (value === 'pen') editor.updateInstanceState({ isPenMode: true });
                        else if (value === 'mouse')
                          editor.updateInstanceState({ isPenMode: false });
                      }}
                      data-umami-event="board-input-mode"
                      data-umami-event-mode={value}
                    >
                      <span className="flex w-5 items-center justify-center">
                        {inputMode === value ? <Check /> : icon}
                      </span>
                      <span>{label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
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

            {/* <DropdownMenuItem
              className={cn('flex h-auto gap-2 p-1', showDebugInfo && 'bg-brand-0')}
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              data-umami-event="board-toggle-debug-info"
            >
              <InfoCircle />
              <span>Отладочная информация</span>
              {showDebugInfo && <Check className="ml-auto" />}
            </DropdownMenuItem> */}

            {isTutor && !isReadonly && <ClearBoardAction onClick={clearBoard} />}

            {isTutor && <BlockBoardAction onClick={toggleReadonly} isReadonly={isReadonly} />}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <HotkeysHelpModal open={hotkeysOpen} onOpenChange={handleOpenHotkeysHelp} />
    </>
  );
};
