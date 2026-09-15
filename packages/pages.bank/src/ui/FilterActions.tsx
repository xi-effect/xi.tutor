import { type ComponentProps } from 'react';
import { PopoverContent } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

export const filterPopoverClass = cn(
  'bg-background-surface text-text-primary z-[80] flex w-[280px] min-w-[280px] max-h-[min(420px,calc(100dvh-24px))] flex-col gap-4 overflow-hidden rounded-2xl border border-border-default p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] outline-none',
);

export const filterScrollAreaClass =
  'flex min-h-0 w-full min-w-0 flex-1 flex-col items-stretch gap-2.5 overflow-y-auto overscroll-contain bg-transparent';

export const FilterPopoverContent = ({
  className,
  children,
  onWheel,
  onTouchMove,
  onPointerDown,
  ...props
}: ComponentProps<typeof PopoverContent>) => (
  <PopoverContent
    align="start"
    sideOffset={8}
    collisionPadding={12}
    className={cn(filterPopoverClass, className)}
    onWheel={(event) => {
      event.stopPropagation();
      onWheel?.(event);
    }}
    onPointerDown={(event) => {
      event.stopPropagation();
      onPointerDown?.(event);
    }}
    onTouchMove={(event) => {
      event.stopPropagation();
      onTouchMove?.(event);
    }}
    {...props}
  >
    {children}
  </PopoverContent>
);

type FilterActionsProps = {
  canReset: boolean;
  onReset: () => void;
  onApply: () => void;
  resetUmami: string;
  applyUmami: string;
};

export const FilterActions = ({
  canReset,
  onReset,
  onApply,
  resetUmami,
  applyUmami,
}: FilterActionsProps) => {
  const { t } = useTranslation('mathBank');

  return (
    <div className="flex w-full shrink-0 flex-col gap-3">
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
          {t('filters.reset')}
        </button>
        <button
          type="button"
          className="bg-action-primary-background-default hover:bg-action-primary-background-hover text-s-base text-text-on-accent rounded-lg px-4 py-2 font-medium"
          onClick={onApply}
          data-umami-event={applyUmami}
        >
          {t('filters.apply')}
        </button>
      </div>
    </div>
  );
};
