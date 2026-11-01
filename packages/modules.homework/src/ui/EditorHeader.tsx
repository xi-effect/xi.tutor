import { Button } from '@xipkg/button';
import { ArrowLeft } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { cn } from '@xipkg/utils';
import {
  pageSwitcherIndicatorClass,
  pageSwitcherTabClass,
  pageSwitcherTrackClass,
} from 'common.ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HOMEWORK_TITLE_MAX } from '../types';

export type EditorMode = 'edit' | 'preview' | 'settings';

type EditorHeaderProps = {
  title: string;
  mode: EditorMode;
  onTitle: (title: string) => void;
  onBack: () => void;
  onMode: (mode: EditorMode) => void;
};

const isEditorMode = (value: string): value is EditorMode =>
  value === 'edit' || value === 'preview' || value === 'settings';

export const EditorHeader = ({ title, mode, onTitle, onBack, onMode }: EditorHeaderProps) => {
  const { t } = useTranslation('homeworkEditor');
  const tabs = useMemo(
    () => [
      { id: 'edit', label: t('modes.edit') },
      { id: 'preview', label: t('modes.preview') },
      { id: 'settings', label: t('modes.settings') },
    ],
    [t],
  );

  return (
    <div className="flex shrink-0 flex-col">
      <header className="grid h-16 min-h-16 w-full grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 bg-transparent px-2">
        <Button
          type="button"
          variant="none"
          size="icon"
          className="size-10"
          aria-label={t('back')}
          onClick={onBack}
        >
          <ArrowLeft className="fill-icon-primary size-5" />
        </Button>

        <div className="min-w-0">
          {mode === 'preview' ? (
            <p className="text-text-primary truncate text-center text-base font-semibold sm:text-2xl">
              {title || t('titlePlaceholder')}
            </p>
          ) : (
            <Input
              value={title}
              maxLength={HOMEWORK_TITLE_MAX}
              placeholder={t('titlePlaceholder')}
              aria-label={t('title')}
              className="text-text-primary h-10 w-full min-w-0 truncate border-none bg-transparent px-1 text-center text-base font-semibold shadow-none sm:px-2 sm:text-2xl"
              onChange={(event) => onTitle(event.target.value)}
            />
          )}
        </div>
        <span aria-hidden />
      </header>

      <div className="flex justify-center px-4 pb-2">
        <SwitcherAnimate
          tabs={tabs}
          activeTab={mode}
          onChange={(tabId) => {
            if (isEditorMode(tabId)) onMode(tabId);
          }}
          className={cn(pageSwitcherTrackClass, 'max-w-full')}
          tabClassName={cn(pageSwitcherTabClass, 'px-2 sm:px-4')}
          indicatorClassName={pageSwitcherIndicatorClass}
        />
      </div>
    </div>
  );
};
