import { cn } from '@xipkg/utils';
import { Check, ChevronSmallBottom } from '@xipkg/icons';
import { forwardRef, type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type PaymentsFilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  open?: boolean;
  selected?: boolean;
  children: ReactNode;
};

export const PaymentsFilterChip = forwardRef<HTMLButtonElement, PaymentsFilterChipProps>(
  ({ open = false, selected = false, children, className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'box-border flex h-[33px] w-fit max-w-full shrink-0 cursor-pointer items-center gap-2 rounded-full border py-2 pr-3 pl-4',
        'text-s-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        open
          ? 'bg-status-info-background border-border-focus text-text-primary'
          : selected
            ? 'bg-background-surface border-border-focus text-text-primary'
            : 'bg-background-surface border-border-control text-text-primary',
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <ChevronSmallBottom
        className={cn(
          'size-4 shrink-0 transition-transform',
          open || selected ? 'fill-icon-brand' : 'fill-icon-secondary',
          open && 'rotate-180',
        )}
      />
    </button>
  ),
);

PaymentsFilterChip.displayName = 'PaymentsFilterChip';

type PaymentsFilterOptionProps = {
  selected: boolean;
  onSelect: () => void;
  umamiEvent: string;
  umamiScope: string;
  children: ReactNode;
};

export const PaymentsFilterOption = ({
  selected,
  onSelect,
  umamiEvent,
  umamiScope,
  children,
}: PaymentsFilterOptionProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="menuitemcheckbox"
      aria-checked={selected}
      tabIndex={0}
      className="text-s-base text-text-primary flex w-full min-w-0 cursor-pointer items-center gap-3 bg-transparent text-left font-medium outline-none"
      onClick={onSelect}
      onPointerDown={(event) => {
        event.preventDefault();
      }}
      onKeyDown={handleKeyDown}
      data-umami-event={umamiEvent}
      data-umami-event-scope={umamiScope}
    >
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-md border bg-transparent',
          selected
            ? 'border-border-focus bg-action-primary-background-default'
            : 'border-border-control',
        )}
      >
        {selected ? <Check className="fill-background-surface size-3.5" /> : null}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </div>
  );
};

type PaymentsFilterActionsProps = {
  canReset: boolean;
  canApply?: boolean;
  onReset: () => void;
  onApply: () => void;
};

export const PaymentsFilterActions = ({
  canReset,
  canApply = true,
  onReset,
  onApply,
}: PaymentsFilterActionsProps) => {
  const { t } = useTranslation('payments');

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
          data-umami-event="payments-filter-reset"
        >
          {t('filters.reset')}
        </button>
        <button
          type="button"
          disabled={!canApply}
          className="bg-action-primary-background-default hover:bg-action-primary-background-hover text-s-base text-text-on-accent rounded-lg px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onApply}
          data-umami-event="payments-filter-apply"
        >
          {t('filters.apply')}
        </button>
      </div>
    </div>
  );
};
