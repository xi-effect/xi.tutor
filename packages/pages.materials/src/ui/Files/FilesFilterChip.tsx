import { cn } from '@xipkg/utils';
import { ChevronSmallBottom } from '@xipkg/icons';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

const filesFilterChipClass = cn(
  'box-border flex h-[33px] w-fit max-w-full shrink-0 cursor-pointer items-center gap-2 rounded-full border py-2 pr-3 pl-4',
  'bg-background-surface border-border-control text-s-base text-text-primary font-medium',
  'outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
);

type FilesFilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  open: boolean;
  children: ReactNode;
  umamiEvent: string;
};

export const FilesFilterChip = forwardRef<HTMLButtonElement, FilesFilterChipProps>(
  ({ open, children, umamiEvent, className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(filesFilterChipClass, className)}
      {...props}
      data-umami-event={umamiEvent}
    >
      <span className="whitespace-nowrap">{children}</span>
      <ChevronSmallBottom
        className={cn(
          'fill-icon-secondary size-4 shrink-0 transition-transform',
          open && 'rotate-180',
        )}
      />
    </button>
  ),
);

FilesFilterChip.displayName = 'FilesFilterChip';
