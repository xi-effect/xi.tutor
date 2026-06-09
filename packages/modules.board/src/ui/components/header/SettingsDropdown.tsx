import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import {
  Check,
  Eraser,
  File,
  InfoCircle,
  Locked,
  MoreVert,
  Pen,
  Shield,
  ShieldOff,
  Trash,
  Unlocked,
} from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useDropdownActions } from './hooks/useDropdownActions';
import { useEffect, useRef, useState } from 'react';
import { useCurrentUser } from 'common.services';
import { toast } from 'sonner';
import { useEditor } from '@ibodr/draw';
import { useDrawStore, useEraserSettingsStore } from '../../../store';
import { HotkeysHelpModal } from '../shared/HotkeysHelp';
import { ERASER_CATEGORIES, INPUT_MODE_OPTIONS, SHAPE_CATEGORIES } from '../../../config';
import { areAllEraserCategoriesEnabled } from '../../../utils/areAllEraserCategoriesEnabled';
import {
  boardMenuCheckboxItemClass,
  boardMenuItemClass,
  boardMenuSurfaceClass,
} from '../../boardTheme';

type ActionPropsT = {
  onClick: () => void;
};

const BlockBoardAction = ({ onClick, isReadonly }: ActionPropsT & { isReadonly: boolean }) => {
  return (
    <DropdownMenuItem
      className={cn(boardMenuItemClass, 'flex gap-2 p-1')}
      onClick={onClick}
      data-umami-event="board-toggle-lock"
      data-umami-event-state={isReadonly ? 'resume' : 'pause'}
    >
      {isReadonly ? <ShieldOff /> : <Shield />}
      <span>{isReadonly ? 'Возобновить работу с доской' : 'Приостановить работу с доской'}</span>
    </DropdownMenuItem>
  );
};

const DownloadBoardAction = ({ onClick }: ActionPropsT) => {
  return (
    <DropdownMenuItem
      className={cn(boardMenuItemClass, 'flex gap-2 p-1')}
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
    <DropdownMenuItem
      className={cn(boardMenuItemClass, 'flex gap-2 p-1')}
      onClick={onClick}
      data-umami-event="board-clear"
    >
      <Trash />
      <span>Очистить доску</span>
    </DropdownMenuItem>
  );
};

const BOARD_ELEMENTS_LIMIT = 4000;
const BOARD_ELEMENTS_WARNING_THRESHOLD = 3000;

export const SettingsDropdown = () => {
  const editor = useEditor();
  const { inputMode, setInputMode } = useDrawStore();
  const {
    isReadonly,
    saveCanvas,
    clearBoard,
    lockShapes,
    unlockShapes,
    toggleReadonly,
    importBoardFromJson,
  } = useDropdownActions();
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

  const { settings, toggleCategory, toggleAll } = useEraserSettingsStore();

  const allChecked = areAllEraserCategoriesEnabled(settings);

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
            <MoreVert size="s" className="h-4 w-4 fill-gray-100 lg:h-6 lg:w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          sideOffset={12}
          align="end"
          className={cn(boardMenuSurfaceClass, 'z-100 flex w-[286px] flex-col gap-1 px-2 py-1')}
        >
          <div className="bg-brand-0/40 mb-1 rounded-lg px-2 py-2">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-gray-80">Заполнение доски</span>
              <span
                className={cn(
                  'text-gray-80 font-medium',
                  isWarningZone && !isLimitReached && 'text-orange-60',
                  isLimitReached && 'text-red-60',
                )}
              >
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
          <DropdownMenuGroup className="space-y-0.5">
            <DropdownMenuItem
              className={cn(boardMenuItemClass, 'flex gap-2 p-1')}
              onClick={() => handleOpenHotkeysHelp(true)}
              data-umami-event="board-hotkeys-help"
            >
              <InfoCircle />
              <span>Горячие клавиши</span>
            </DropdownMenuItem>
            {editor && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className={cn(boardMenuItemClass, 'flex gap-2 p-1')}>
                  <Pen />
                  <span>Режим ввода</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className={cn(boardMenuSurfaceClass, 'z-100 w-[250px]')}>
                  {INPUT_MODE_OPTIONS.map(({ value, label, icon }) => (
                    <DropdownMenuItem
                      key={value}
                      className={cn(boardMenuItemClass, 'flex gap-2 p-1')}
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
                className={cn(boardMenuItemClass, 'flex gap-2 p-1')}
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

            {isTutor && !isReadonly && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className={cn(boardMenuItemClass, 'flex gap-2 p-1')}>
                  <Locked />
                  <span>Заблокировать элементы</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className={cn(boardMenuSurfaceClass, 'z-100 w-[250px]')}>
                  <p className="text-gray-60 px-3 py-2 text-xs">
                    Можно заблокировать все элементы на доске или выбрать конкретные категории
                  </p>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={cn(boardMenuItemClass, 'flex gap-2 px-3 py-1.5')}
                    onClick={() => lockShapes()}
                    data-umami-event="board-lock-all"
                  >
                    <span>Все элементы</span>
                  </DropdownMenuItem>
                  {SHAPE_CATEGORIES.map(({ label, types }) => (
                    <DropdownMenuItem
                      key={label}
                      className={cn(boardMenuItemClass, 'flex gap-2 px-3 py-1.5')}
                      onClick={() => lockShapes(types)}
                      data-umami-event="board-lock-category"
                      data-umami-event-category={label}
                    >
                      <span>{label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}

            {isTutor && !isReadonly && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className={cn(boardMenuItemClass, 'flex gap-2 p-1')}>
                  <Unlocked />
                  <span>Разблокировать элементы</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className={cn(boardMenuSurfaceClass, 'z-100 w-[250px]')}>
                  <p className="text-gray-60 px-3 py-2 text-xs">
                    Снимает блокировку, позволяя снова редактировать элементы на доске
                  </p>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={cn(boardMenuItemClass, 'flex gap-2 px-3 py-1.5')}
                    onClick={() => unlockShapes()}
                    data-umami-event="board-unlock-all"
                  >
                    <span>Все элементы</span>
                  </DropdownMenuItem>
                  {SHAPE_CATEGORIES.map(({ label, types }) => (
                    <DropdownMenuItem
                      key={label}
                      className={cn(boardMenuItemClass, 'flex gap-2 px-3 py-1.5')}
                      onClick={() => unlockShapes(types)}
                      data-umami-event="board-unlock-category"
                      data-umami-event-category={label}
                    >
                      <span>{label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}

            {isTutor && !isReadonly && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className={cn(boardMenuItemClass, 'flex gap-2 p-1')}>
                  <Eraser />
                  <span>Ластик</span>
                </DropdownMenuSubTrigger>

                <DropdownMenuSubContent className={cn(boardMenuSurfaceClass, 'z-100 w-[260px]')}>
                  <p className="text-gray-60 px-3 py-2 text-xs">
                    Выберите, какие элементы можно стирать ластиком
                  </p>

                  <DropdownMenuSeparator />

                  <DropdownMenuCheckboxItem
                    checked={allChecked}
                    onCheckedChange={() => toggleAll()}
                    onSelect={(e) => e.preventDefault()}
                    className={cn(boardMenuCheckboxItemClass, 'py-1.5 pr-3 pl-8')}
                  >
                    Все элементы
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuSeparator />

                  {ERASER_CATEGORIES.map(({ key, label }) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={settings[key]}
                      onCheckedChange={() => toggleCategory(key)}
                      onSelect={(e) => e.preventDefault()}
                      className={cn(boardMenuCheckboxItemClass, 'py-1.5 pr-3 pl-8')}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}

            {isTutor && <BlockBoardAction onClick={toggleReadonly} isReadonly={isReadonly} />}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <HotkeysHelpModal open={hotkeysOpen} onOpenChange={handleOpenHotkeysHelp} />
    </>
  );
};
