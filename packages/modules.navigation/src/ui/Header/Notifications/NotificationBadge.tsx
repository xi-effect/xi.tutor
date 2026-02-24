import { cn } from '@xipkg/utils';

interface NotificationBadgeProps {
  count: number | string;
  className?: string;
}

export const NotificationBadge = ({ count, className }: NotificationBadgeProps) => {
  if (count === 0 || count === '0') return null;

  return (
    <div
      className={cn(
        'text-xxs-base-size bg-brand-100 absolute -top-2 -right-2 flex h-5 w-fit min-w-5 items-center justify-center rounded-full p-1',
        className,
      )}
    >
      <p className={cn('text-gray-0', className)}>{count}</p>
    </div>
  );
};
