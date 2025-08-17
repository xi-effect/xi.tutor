import { cn } from '@xipkg/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge = ({ count, className }: NotificationBadgeProps) => {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        'bg-brand-100 text-xxs-base text-brand-0 absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full font-normal',
        className,
      )}
    >
      {count > 99 ? '99+' : count}
    </div>
  );
};
