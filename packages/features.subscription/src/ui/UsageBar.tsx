import { cn } from '@xipkg/utils';

export const UsageBar = ({
  used,
  total,
  className,
}: {
  used: number;
  total: number;
  className?: string;
}) => {
  const percent = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const reached = used >= total;

  return (
    <div className={cn('bg-background-subtle h-2 w-full overflow-hidden rounded-full', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all',
          reached ? 'bg-status-error-accent' : 'bg-action-primary-background-default',
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};
