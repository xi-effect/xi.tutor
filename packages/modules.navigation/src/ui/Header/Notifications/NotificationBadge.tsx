import { cn } from '@xipkg/utils';

import { useSidebar } from '@xipkg/sidebar';

interface NotificationBadgeProps {
  count: number | string;
  className?: string;
}

export const NotificationBadge = ({ count, className }: NotificationBadgeProps) => {
  const { state } = useSidebar();

  if (count === 0 || count === '0') return null;

  return (
    <div
      className={cn(
        'text-xxs-base-size bg-brand-100 absolute flex h-5 w-fit min-w-5 items-center justify-center rounded-full p-1 transition-[top,right] duration-200 ease-out',
        state === 'collapsed' ? 'top-0 -right-3' : 'top-2.5 right-2',
        className,
      )}
    >
      <p className={cn('text-gray-0', className)}>{count}</p>
    </div>
  );
};
