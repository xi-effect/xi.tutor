import { cn } from '@xipkg/utils';
import { ChevronSmallBottom } from '@xipkg/icons';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  open: boolean;
  selected?: boolean;
  children: ReactNode;
  umamiEvent: string;
};

export const FilterChip = forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ open, selected = false, children, umamiEvent, className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'box-border flex h-[33px] w-fit max-w-full shrink-0 cursor-pointer items-center gap-2 rounded-full border py-2 pr-3 pl-4',
        'text-s-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        open
          ? 'bg-status-info-background border-border-focus text-text-primary'
          : selected
            ? 'bg-background-surface border-border-focus text-text-primary hover:bg-status-info-background'
            : 'bg-background-surface border-border-control text-text-primary hover:bg-background-page',
        className,
      )}
      {...props}
      data-umami-event={umamiEvent}
    >
      <span className="whitespace-nowrap">{children}</span>
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

FilterChip.displayName = 'FilterChip';
