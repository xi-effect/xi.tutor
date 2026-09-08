import { Badge } from '@xipkg/badge';
import { cn } from '@xipkg/utils';
import {
  requestProFeatureDialog,
  useCanUseFeature,
  type SubscriptionFeatureId,
} from 'common.subscription';
import { useTranslation } from 'react-i18next';

type ProBadgeProps = {
  featureId?: SubscriptionFeatureId;
  className?: string;
};

export const ProBadge = ({ featureId = 'extraProTools', className }: ProBadgeProps) => {
  const { t } = useTranslation('subscription');
  const allowed = useCanUseFeature(featureId);

  if (allowed) {
    return null;
  }

  return (
    <button
      type="button"
      className="inline-flex"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        requestProFeatureDialog(featureId);
      }}
    >
      <Badge
        size="s"
        className={cn(
          'bg-background-subtle text-text-secondary h-4 rounded-md border-none px-1.5 py-0 text-[10px] leading-4 font-medium',
          className,
        )}
      >
        {t('pro.badge')}
      </Badge>
    </button>
  );
};
