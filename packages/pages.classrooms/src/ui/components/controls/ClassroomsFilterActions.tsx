import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

type ClassroomsFilterActionsProps = {
  canReset: boolean;
  onReset: () => void;
  onApply: () => void;
};

export const ClassroomsFilterActions = ({
  canReset,
  onReset,
  onApply,
}: ClassroomsFilterActionsProps) => {
  const { t } = useTranslation('classrooms');

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
          data-umami-event="classrooms-status-filter-reset"
        >
          {t('filters.reset')}
        </button>
        <button
          type="button"
          className="bg-action-primary-background-default hover:bg-action-primary-background-hover text-s-base text-text-on-accent rounded-lg px-4 py-2 font-medium"
          onClick={onApply}
          data-umami-event="classrooms-status-filter-apply"
        >
          {t('filters.apply')}
        </button>
      </div>
    </div>
  );
};
