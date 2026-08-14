import { ArrowRight, Check } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BoardDrawer, boardDrawerRowClass } from '../shared/BoardDrawer';
import {
  ERASER_CATEGORIES,
  INPUT_MODE_OPTIONS,
  SHAPE_CATEGORIES,
  BOARD_BACKGROUND_COLOR_OPTIONS,
  BOARD_BACKGROUND_TYPE_OPTIONS,
  getBoardBackgroundColorLabel,
  getBoardBackgroundTypeLabel,
  normalizeBoardBackgroundType,
} from '../../../config';
import type { InputMode } from '../../../store/useDrawStore';
import type { BoardBackgroundState } from '../../../utils/boardBackground';
import type { BoardBackgroundColorId } from '../../../config';

const BOARD_ELEMENTS_LIMIT = 4000;

type SettingsView =
  'root' | 'inputMode' | 'backgroundType' | 'backgroundColor' | 'lock' | 'unlock' | 'eraser';

type SettingsMobileDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elementsCount: number;
  progressPercent: number;
  isWarningZone: boolean;
  isLimitReached: boolean;
  commentsVisible: boolean;
  onToggleComments: () => void;
  onOpenHotkeys: () => void;
  onDownload: () => void;
  onImport: () => void;
  onClear: () => void;
  onToggleReadonly: () => void;
  isReadonly: boolean;
  isTutor: boolean;
  showImportOption: boolean;
  hasEditor: boolean;
  inputMode: InputMode;
  onInputModeChange: (value: InputMode) => void;
  background: BoardBackgroundState;
  onBackgroundTypeChange: (value: BoardBackgroundState['type']) => void;
  onBackgroundColorChange: (value: BoardBackgroundColorId) => void;
  onLock: (types?: string[]) => void;
  onUnlock: (types?: string[]) => void;
  eraserSettings: Record<string, boolean>;
  onToggleEraserCategory: (key: string) => void;
  onToggleAllEraser: () => void;
  allEraserChecked: boolean;
};

export const SettingsMobileDrawer = ({
  open,
  onOpenChange,
  elementsCount,
  progressPercent,
  isWarningZone,
  isLimitReached,
  commentsVisible,
  onToggleComments,
  onOpenHotkeys,
  onDownload,
  onImport,
  onClear,
  onToggleReadonly,
  isReadonly,
  isTutor,
  showImportOption,
  hasEditor,
  inputMode,
  onInputModeChange,
  background,
  onBackgroundTypeChange,
  onBackgroundColorChange,
  onLock,
  onUnlock,
  eraserSettings,
  onToggleEraserCategory,
  onToggleAllEraser,
  allEraserChecked,
}: SettingsMobileDrawerProps) => {
  const { t } = useTranslation('board');
  const [view, setView] = useState<SettingsView>('root');

  useEffect(() => {
    if (!open) setView('root');
  }, [open]);

  const titleByView: Record<SettingsView, string> = {
    root: t('settings.menuTitle'),
    inputMode: t('settings.inputMode'),
    backgroundType: t('settings.backgroundType'),
    backgroundColor: t('settings.backgroundColor'),
    lock: t('settings.lockElements'),
    unlock: t('settings.unlockElements'),
    eraser: t('settings.eraser'),
  };

  const close = () => onOpenChange(false);

  return (
    <BoardDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={titleByView[view]}
      onBack={view === 'root' ? undefined : () => setView('root')}
    >
      {view === 'root' && (
        <div className="flex flex-col gap-3">
          <div className="border-border-default bg-background-surface rounded-xl border px-4 py-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-text-primary">{t('settings.boardFill')}</span>
              <span
                className={cn(
                  'text-text-primary font-medium',
                  isWarningZone && !isLimitReached && 'text-tag-orange-accent',
                  isLimitReached && 'text-text-danger',
                )}
              >
                {elementsCount} / {BOARD_ELEMENTS_LIMIT}
              </span>
            </div>
            <div className="bg-background-subtle h-2 w-full overflow-hidden rounded-full">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  isLimitReached
                    ? 'bg-status-error-accent'
                    : isWarningZone
                      ? 'bg-tag-orange-accent'
                      : 'bg-action-primary-background-default',
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button type="button" className={boardDrawerRowClass} onClick={onOpenHotkeys}>
            <span>{t('settings.hotkeys')}</span>
          </button>
          <button type="button" className={boardDrawerRowClass} onClick={onToggleComments}>
            <span>{commentsVisible ? t('settings.hideComments') : t('settings.showComments')}</span>
          </button>
          {hasEditor && (
            <SubRow label={t('settings.inputMode')} onClick={() => setView('inputMode')} />
          )}
          <button
            type="button"
            className={boardDrawerRowClass}
            onClick={() => {
              onDownload();
              close();
            }}
          >
            <span>{t('settings.download')}</span>
          </button>
          <SubRow
            label={t('settings.backgroundType')}
            value={getBoardBackgroundTypeLabel(background.type)}
            onClick={() => setView('backgroundType')}
          />
          <SubRow
            label={t('settings.backgroundColor')}
            value={getBoardBackgroundColorLabel(background.color)}
            onClick={() => setView('backgroundColor')}
          />
          {isTutor && !isReadonly && showImportOption && (
            <button type="button" className={boardDrawerRowClass} onClick={onImport}>
              <span>{t('settings.importJson')}</span>
            </button>
          )}
          {isTutor && !isReadonly && (
            <button
              type="button"
              className={boardDrawerRowClass}
              onClick={() => {
                close();
                onClear();
              }}
            >
              <span>{t('settings.clearBoard')}</span>
            </button>
          )}
          {isTutor && !isReadonly && (
            <SubRow label={t('settings.lockElements')} onClick={() => setView('lock')} />
          )}
          {isTutor && !isReadonly && (
            <SubRow label={t('settings.unlockElements')} onClick={() => setView('unlock')} />
          )}
          {isTutor && !isReadonly && (
            <SubRow label={t('settings.eraser')} onClick={() => setView('eraser')} />
          )}
          {isTutor && (
            <button
              type="button"
              className={boardDrawerRowClass}
              onClick={() => {
                onToggleReadonly();
                close();
              }}
            >
              <span>{isReadonly ? t('settings.resumeBoard') : t('settings.pauseBoard')}</span>
            </button>
          )}
        </div>
      )}

      {view === 'inputMode' && (
        <div className="flex flex-col gap-3">
          {INPUT_MODE_OPTIONS.map(({ value, label }) => (
            <ChoiceRow
              key={value}
              label={label}
              selected={inputMode === value}
              onClick={() => {
                onInputModeChange(value);
                setView('root');
              }}
            />
          ))}
        </div>
      )}

      {view === 'backgroundType' && (
        <div className="flex flex-col gap-3">
          {BOARD_BACKGROUND_TYPE_OPTIONS.map(({ value, label }) => (
            <ChoiceRow
              key={value}
              label={label}
              selected={normalizeBoardBackgroundType(background.type) === value}
              onClick={() => {
                onBackgroundTypeChange(value);
                setView('root');
              }}
            />
          ))}
        </div>
      )}

      {view === 'backgroundColor' && (
        <div className="flex flex-col gap-3">
          {BOARD_BACKGROUND_COLOR_OPTIONS.map(({ value, label }) => (
            <ChoiceRow
              key={value}
              label={label}
              selected={background.color === value}
              onClick={() => {
                onBackgroundColorChange(value);
                setView('root');
              }}
            />
          ))}
        </div>
      )}

      {view === 'lock' && (
        <div className="flex flex-col gap-3">
          <p className="text-text-secondary px-3 py-1 text-xs">{t('settings.lockHint')}</p>
          <button
            type="button"
            className={boardDrawerRowClass}
            onClick={() => {
              onLock();
              close();
            }}
          >
            <span>{t('settings.allElements')}</span>
          </button>
          {SHAPE_CATEGORIES.map(({ label, types }) => (
            <button
              key={label}
              type="button"
              className={boardDrawerRowClass}
              onClick={() => {
                onLock(types);
                close();
              }}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {view === 'unlock' && (
        <div className="flex flex-col gap-3">
          <p className="text-text-secondary px-3 py-1 text-xs">{t('settings.unlockHint')}</p>
          <button
            type="button"
            className={boardDrawerRowClass}
            onClick={() => {
              onUnlock();
              close();
            }}
          >
            <span>{t('settings.allElements')}</span>
          </button>
          {SHAPE_CATEGORIES.map(({ label, types }) => (
            <button
              key={label}
              type="button"
              className={boardDrawerRowClass}
              onClick={() => {
                onUnlock(types);
                close();
              }}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {view === 'eraser' && (
        <div className="flex flex-col gap-3">
          <p className="text-text-secondary px-3 py-1 text-xs">{t('settings.eraserHint')}</p>
          <ChoiceRow
            label={t('settings.allElements')}
            selected={allEraserChecked}
            onClick={onToggleAllEraser}
          />
          {ERASER_CATEGORIES.map(({ key, label }) => (
            <ChoiceRow
              key={key}
              label={label}
              selected={eraserSettings[key]}
              onClick={() => onToggleEraserCategory(key)}
            />
          ))}
        </div>
      )}
    </BoardDrawer>
  );
};

const SubRow = ({
  label,
  value,
  onClick,
}: {
  label: string;
  value?: string;
  onClick: () => void;
}) => (
  <button type="button" className={boardDrawerRowClass} onClick={onClick}>
    <span className="min-w-0 flex-1">{label}</span>
    {value ? (
      <span className="text-text-secondary max-w-[40%] truncate text-xs">{value}</span>
    ) : null}
    <ArrowRight className="fill-icon-secondary size-4 shrink-0" />
  </button>
);

const ChoiceRow = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button type="button" className={boardDrawerRowClass} onClick={onClick}>
    <span className="flex w-5 shrink-0 items-center justify-center">
      {selected ? <Check className="fill-icon-brand size-4" /> : null}
    </span>
    <span>{label}</span>
  </button>
);
