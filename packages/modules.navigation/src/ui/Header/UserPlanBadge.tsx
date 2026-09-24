import { cn } from '@xipkg/utils';
import { useSubscriptionPlan } from 'common.subscription';
import { useTranslation } from 'react-i18next';

type UserPlanBadgeProps = {
  className?: string;
};

export const UserPlanBadge = ({ className }: UserPlanBadgeProps) => {
  const { t } = useTranslation('navigation');
  const { isPro } = useSubscriptionPlan();

  return (
    <span
      className={cn(
        'inline-flex h-5 max-w-full items-center truncate rounded-md px-1.5 text-[11px] leading-4 font-medium',
        isPro
          ? 'bg-status-info-background text-text-link'
          : 'bg-background-subtle text-text-secondary',
        className,
      )}
    >
      {t(isPro ? 'plan.pro' : 'plan.basic')}
    </span>
  );
};
