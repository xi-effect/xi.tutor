import { cn } from '@xipkg/utils';
import { readCachedPlanId, useSubscriptionPlan } from 'common.subscription';
import { useCurrentUser } from 'common.services';
import { useTranslation } from 'react-i18next';

type UserPlanBadgeProps = {
  className?: string;
};

export const UserPlanBadge = ({ className }: UserPlanBadgeProps) => {
  const { t } = useTranslation('navigation');
  const { data: user } = useCurrentUser();
  const { isPro, isPlanReady, isPlanError } = useSubscriptionPlan();
  const isTutor = user?.default_layout === 'tutor';
  const cachedPlanId = isTutor ? readCachedPlanId() : null;
  const pro = isPlanReady ? isPro : cachedPlanId === 'pro';
  const known = (isTutor && isPlanReady) || cachedPlanId !== null;

  if (!known || (isPlanError && cachedPlanId === null)) return null;

  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center rounded-md px-1.5 text-[11px] leading-4 font-medium',
        pro
          ? 'bg-status-info-background text-text-link'
          : 'bg-background-subtle text-text-secondary',
        className,
      )}
    >
      {t(pro ? 'plan.pro' : 'plan.basic')}
    </span>
  );
};
