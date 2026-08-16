import { cn } from '@xipkg/utils';
import { formatMoney } from 'features.charts';
import { getDateLocale } from 'common.ui';
import { useTranslation } from 'react-i18next';
import type { AnalyticsDeltaKind } from './types';

type AnalyticsKpiCardProps = {
  title: string;
  hint: string;
  value: string;
  caption?: string;
  deltaAbs?: number | null;
  deltaRatio?: number | null;
  deltaKind?: AnalyticsDeltaKind;
  showDelta?: boolean;
};

const formatDelta = (deltaAbs: number, locale: string) => {
  const sign = deltaAbs > 0 ? '+' : '';
  return `${sign}${formatMoney(deltaAbs, locale)}`;
};

const formatRatio = (ratio: number) => {
  const sign = ratio > 0 ? '+' : '';
  return `${sign}${Math.round(ratio * 100)}%`;
};

export const AnalyticsKpiCard = ({
  title,
  hint,
  value,
  caption,
  deltaAbs,
  deltaRatio,
  deltaKind = 'none',
  showDelta = false,
}: AnalyticsKpiCardProps) => {
  const { t } = useTranslation('payments');
  const locale = getDateLocale();

  const deltaTone =
    deltaKind === 'none' || deltaAbs == null
      ? 'text-text-secondary'
      : deltaAbs > 0
        ? 'text-status-success-text'
        : deltaAbs < 0
          ? 'text-text-danger'
          : 'text-text-secondary';

  return (
    <div className="bg-background-surface flex h-full min-h-[132px] w-full min-w-0 flex-col justify-between rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-1">
        <p className="text-s-base text-text-primary font-medium">{title}</p>
        <p className="text-xs-base text-text-secondary">{hint}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-text-primary text-2xl leading-7 font-medium tabular-nums">{value}</p>
        {caption && <p className="text-xs-base text-text-secondary">{caption}</p>}
        {showDelta && deltaKind === 'change' && deltaAbs != null && (
          <p className={cn('text-xs-base font-medium tabular-nums', deltaTone)}>
            {formatDelta(deltaAbs, locale)}
            {deltaRatio != null ? ` · ${formatRatio(deltaRatio)}` : ''}
          </p>
        )}
        {showDelta && deltaKind === 'new' && (
          <p className="text-xs-base text-status-success-text font-medium">
            {t('analytics.delta.new')}
          </p>
        )}
      </div>
    </div>
  );
};
