import { Toggle } from '@xipkg/toggle';
import { ColorPicker, Grid, Pen } from '@xipkg/icons';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@xipkg/select';
import {
  BOARD_BACKGROUND_COLOR_CHOICES,
  BOARD_BACKGROUND_TYPE_CHOICES,
  BOARD_TOOLBAR_DOCKS,
  isBoardBackgroundColorId,
  isBoardBackgroundType,
  isBoardToolbarDock,
  useBoardPreferencesStore,
  type BoardToolbarDock,
} from 'modules.board/preferences';
import { useTranslation } from 'react-i18next';

export const Board = () => {
  const { t } = useTranslation('profile');
  const { t: tBoard } = useTranslation('board');
  const autoCloseDrawShapes = useBoardPreferencesStore((s) => s.autoCloseDrawShapes);
  const setAutoCloseDrawShapes = useBoardPreferencesStore((s) => s.setAutoCloseDrawShapes);
  const defaultBackgroundType = useBoardPreferencesStore((s) => s.defaultBackgroundType);
  const setDefaultBackgroundType = useBoardPreferencesStore((s) => s.setDefaultBackgroundType);
  const defaultBackgroundColor = useBoardPreferencesStore((s) => s.defaultBackgroundColor);
  const setDefaultBackgroundColor = useBoardPreferencesStore((s) => s.setDefaultBackgroundColor);
  const toolbarDock = useBoardPreferencesStore((s) => s.toolbarDock);
  const setToolbarDock = useBoardPreferencesStore((s) => s.setToolbarDock);

  return (
    <>
      <div className="border-border-strong flex w-full flex-col rounded-2xl border p-1">
        <div className="flex w-full flex-col p-3">
          <span className="dark:text-text-primary text-xl font-semibold">{t('board.pencil')}</span>
        </div>
        <div className="mt-2 flex w-full flex-col gap-3 p-3">
          <div className="flex w-full flex-row items-center justify-between gap-4">
            <div className="flex flex-row gap-4">
              <Pen className="fill-icon-brand shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="dark:text-text-primary text-base leading-6 font-semibold">
                  {t('board.autoCloseDrawShapes')}
                </span>
                <span className="text-text-secondary text-s-base">
                  {t('board.autoCloseDrawShapesHint')}
                </span>
              </div>
            </div>
            <Toggle
              checked={autoCloseDrawShapes}
              size="s"
              onCheckedChange={setAutoCloseDrawShapes}
              className="shrink-0"
              data-umami-event="profile-board-auto-close-draw-shapes"
              data-umami-event-state={autoCloseDrawShapes ? 'on' : 'off'}
            />
          </div>
        </div>
      </div>

      <div className="border-border-strong mt-4 flex w-full flex-col rounded-2xl border p-1">
        <div className="flex w-full flex-col gap-0.5 p-3">
          <span className="dark:text-text-primary text-xl font-semibold">{t('board.toolbar')}</span>
          <span className="text-text-secondary text-s-base">{t('board.toolbarHint')}</span>
        </div>
        <div className="mt-2 flex w-full flex-col gap-3 p-3">
          <div className="flex w-full flex-col items-start justify-center gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-row gap-4">
              <ToolbarPositionIcon />
              <span className="dark:text-text-primary text-base leading-6 font-semibold">
                {t('board.toolbarPosition')}
              </span>
            </div>
            <Select
              value={toolbarDock}
              onValueChange={(value) => {
                if (isBoardToolbarDock(value)) setToolbarDock(value);
              }}
            >
              <SelectTrigger
                className="dark:text-text-primary ml-0 w-full sm:ml-auto sm:w-[250px]"
                data-umami-event="profile-board-toolbar-dock"
                data-umami-event-dock={toolbarDock}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {BOARD_TOOLBAR_DOCKS.map((value) => (
                    <SelectItem key={value} value={value} className="dark:text-text-primary">
                      {t(toolbarDockLabelKey(value))}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-border-strong mt-4 flex w-full flex-col rounded-2xl border p-1">
        <div className="flex w-full flex-col gap-0.5 p-3">
          <span className="dark:text-text-primary text-xl font-semibold">
            {t('board.newBoard')}
          </span>
          <span className="text-text-secondary text-s-base">{t('board.newBoardHint')}</span>
        </div>
        <div className="mt-2 flex w-full flex-col gap-3 p-3">
          <div className="flex w-full flex-col items-start justify-center gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-row gap-4">
              <Grid className="fill-icon-brand shrink-0" />
              <span className="dark:text-text-primary text-base leading-6 font-semibold">
                {t('board.backgroundType')}
              </span>
            </div>
            <Select
              value={defaultBackgroundType}
              onValueChange={(value) => {
                if (isBoardBackgroundType(value)) setDefaultBackgroundType(value);
              }}
            >
              <SelectTrigger
                className="dark:text-text-primary ml-0 w-full sm:ml-auto sm:w-[250px]"
                data-umami-event="profile-board-default-background-type"
                data-umami-event-type={defaultBackgroundType}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {BOARD_BACKGROUND_TYPE_CHOICES.map(({ value, labelKey }) => (
                    <SelectItem key={value} value={value} className="dark:text-text-primary">
                      {tBoard(labelKey)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full flex-col items-start justify-center gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-row gap-4">
              <ColorPicker className="fill-icon-brand shrink-0" />
              <span className="dark:text-text-primary text-base leading-6 font-semibold">
                {t('board.backgroundColor')}
              </span>
            </div>
            <Select
              value={defaultBackgroundColor}
              onValueChange={(value) => {
                if (isBoardBackgroundColorId(value)) setDefaultBackgroundColor(value);
              }}
            >
              <SelectTrigger
                className="dark:text-text-primary ml-0 w-full sm:ml-auto sm:w-[250px]"
                data-umami-event="profile-board-default-background-color"
                data-umami-event-color={defaultBackgroundColor}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {BOARD_BACKGROUND_COLOR_CHOICES.map(({ value, labelKey }) => (
                    <SelectItem key={value} value={value} className="dark:text-text-primary">
                      {tBoard(labelKey)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </>
  );
};

function toolbarDockLabelKey(dock: BoardToolbarDock) {
  const key = {
    bottom: 'board.toolbarBottom',
    left: 'board.toolbarLeft',
    top: 'board.toolbarTop',
    right: 'board.toolbarRight',
  } as const;
  return key[dock];
}

function ToolbarPositionIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="text-icon-brand size-6 shrink-0" fill="none">
      <rect x="3" y="15" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3v8M8.5 7 12 3.5 15.5 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
