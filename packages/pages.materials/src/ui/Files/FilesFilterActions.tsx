import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

export const filesFilterPopoverClass = cn(
  'bg-background-surface text-text-primary z-50 flex w-[280px] min-w-[280px] flex-col gap-4 rounded-2xl border border-border-default p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] outline-none',
);

type FilesFilterActionsProps = {
  canReset: boolean;
  onReset: () => void;
  onApply: () => void;
  resetUmami: string;
  applyUmami: string;
};

export const FilesFilterActions = ({
  canReset,
  onReset,
  onApply,
  resetUmami,
  applyUmami,
}: FilesFilterActionsProps) => {
  const { t } = useTranslation('materials');

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="bg-border-default h-px w-full" />
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          disabled={!canReset}
          className={cn(
            'text-s-base rounded-lg bg-transparent px-3 py-2 font-medium',
            'disabled:bg-transparent disabled:opacity-100',
            canReset ? 'text-text-link hover:bg-status-info-background' : 'text-text-secondary',
          )}
          onClick={onReset}
          data-umami-event={resetUmami}
        >
          {t('files.reset')}
        </button>
        <button
          type="button"
          className="bg-action-primary-background-default hover:bg-action-primary-background-hover text-s-base text-text-on-accent rounded-lg px-4 py-2 font-medium"
          onClick={onApply}
          data-umami-event={applyUmami}
        >
          {t('files.apply')}
        </button>
      </div>
    </div>
  );
};
