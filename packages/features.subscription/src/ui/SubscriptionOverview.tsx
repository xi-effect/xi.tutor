import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@xipkg/button';
import { InfoCircle } from '@xipkg/icons';
import { Link } from '@xipkg/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import {
  formatPlanStorage,
  getRemainingSubscriptionDays,
  isSubscriptionPeriodActive,
  TRIAL_PROMO_CODE,
  useSubscriptionPlan,
  useSubscriptionUiStore,
} from 'common.subscription';
import {
  useClassroomCounts,
  useCurrentSubscription,
  useRedeemPromocode,
  useStorageUsage,
} from 'common.services';
import { getAppLanguage, useAppTimeZone } from 'common.ui';
import {
  getSubscriptionAnalyticsSource,
  isSubscriptionAnalyticsSource,
  trackSubscriptionPricingViewed,
} from 'common.utils';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { getRenewalHoverDate } from '../utils/dates';
import { PromoCodeField } from './PromoCodeField';
import { UsageBar } from './UsageBar';

const SOVLIUM_PRICES_URL = 'https://sovlium.ru/prices';

const TEXT_MORPH_TRANSITION = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 34,
  mass: 0.8,
};

const formatHoverDate = (
  prefix: string,
  parts: { day: number; before: string; after: string } | null,
): string => {
  if (!parts) return prefix;

  const afterGap = parts.after && !/^[,.]/.test(parts.after) ? ' ' : '';
  const body = `${parts.before ? `${parts.before} ` : ''}${parts.day}${afterGap}${parts.after}`;
  return `${prefix} ${body}`.trim();
};

const RemainingDays = ({ days, date }: { days: string; date: string }) => {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const progress = useMotionValue(0);
  const daysRef = useRef<HTMLSpanElement>(null);
  const dateRef = useRef<HTMLSpanElement>(null);
  const [daysWidth, setDaysWidth] = useState(0);
  const [dateWidth, setDateWidth] = useState(0);

  useLayoutEffect(() => {
    setDaysWidth(daysRef.current?.offsetWidth ?? 0);
    setDateWidth(dateRef.current?.offsetWidth ?? 0);
  }, [date, days]);

  useEffect(() => {
    if (reduceMotion) {
      progress.set(hovered ? 1 : 0);
      return;
    }

    const controls = animate(progress, hovered ? 1 : 0, TEXT_MORPH_TRANSITION);
    return () => controls.stop();
  }, [hovered, progress, reduceMotion]);

  const width = useTransform(progress, [0, 1], [daysWidth, dateWidth]);
  const daysOpacity = useTransform(progress, [0, 1], [1, 0]);
  const dateOpacity = useTransform(progress, [0, 1], [0, 1]);
  const measured = daysWidth > 0 && dateWidth > 0;

  return (
    <span
      className="relative inline-flex justify-end"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="note"
      aria-label={`${days}, ${date}`}
    >
      <span
        ref={daysRef}
        aria-hidden
        className="pointer-events-none absolute whitespace-nowrap opacity-0"
      >
        {days}
      </span>
      <span
        ref={dateRef}
        aria-hidden
        className="pointer-events-none absolute whitespace-nowrap opacity-0"
      >
        {date}
      </span>
      <motion.span
        className="inline-flex justify-end overflow-visible"
        style={measured ? { width } : undefined}
      >
        <span className="inline-grid w-max justify-items-end">
          <motion.span
            style={{ opacity: daysOpacity }}
            className="col-start-1 row-start-1 whitespace-nowrap"
          >
            {days}
          </motion.span>
          <motion.span
            style={{ opacity: dateOpacity }}
            className="col-start-1 row-start-1 whitespace-nowrap"
          >
            {date}
          </motion.span>
        </span>
      </motion.span>
    </span>
  );
};

const ProTrialBanner = () => {
  const { t } = useTranslation('subscription');
  const redeemPromocode = useRedeemPromocode();
  const [error, setError] = useState(false);

  const handleActivate = async () => {
    if (redeemPromocode.isPending) return;
    setError(false);

    try {
      await redeemPromocode.mutateAsync(TRIAL_PROMO_CODE);
    } catch {
      setError(true);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-action-primary-background-pressed flex flex-col items-start gap-3 rounded-2xl px-5 py-4 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-text-on-accent text-m-base leading-tight font-semibold">
            {t('overview.trialTitle')}
          </div>
          <p className="text-text-on-accent/85 text-s-base mt-0.5 leading-snug">
            {t('overview.trialDescription')}
          </p>
        </div>
        <Button
          type="button"
          variant="none"
          className="bg-background-surface text-text-link hover:bg-background-surface/90 flex h-auto shrink-0 items-center justify-center rounded-[10px] px-4 py-2 text-sm leading-5 font-medium disabled:cursor-not-allowed disabled:opacity-70"
          data-promo-code={TRIAL_PROMO_CODE}
          disabled={redeemPromocode.isPending}
          onClick={() => void handleActivate()}
        >
          {t('overview.trialActivate')}
        </Button>
      </div>
      {error ? (
        <p className="text-status-error-text text-sm" role="alert">
          {t('overview.trialError')}
        </p>
      ) : null}
    </div>
  );
};

const ClassroomsUsage = ({ limit }: { limit: number }) => {
  const { t } = useTranslation('subscription');
  const countQuery = useClassroomCounts();

  if (countQuery.isError) {
    return (
      <div className="flex items-center justify-between gap-4">
        <span className="text-text-secondary text-sm">{t('overview.classrooms')}</span>
        <Button
          type="button"
          variant="ghost"
          size="s"
          className="h-8 px-0"
          onClick={() => void countQuery.refetch()}
        >
          {t('overview.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-text-secondary text-sm">{t('overview.classrooms')}</span>
      <span className="text-text-primary text-sm font-medium">
        {typeof countQuery.data?.active === 'number'
          ? t('overview.usage', { used: countQuery.data.active, total: limit })
          : t('overview.loading')}
      </span>
    </div>
  );
};

const StorageInfoHint = () => {
  const { t } = useTranslation('subscription');

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex size-4 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 shadow-none"
            aria-label={t('overview.storageInfoLabel')}
          >
            <InfoCircle size="sm" theme="muted" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="center"
          className="z-[200] max-w-72 leading-5 font-normal"
        >
          {t('overview.storageInfo')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const SubscriptionOverview = () => {
  const { t } = useTranslation('subscription');
  useAppTimeZone();
  const { planId, tariff, isBasic, isPlanError, isPlanLoading, refetchPlan } =
    useSubscriptionPlan();
  const analyticsSource = useSubscriptionUiStore((state) => state.analyticsSource);
  const subscriptionQuery = useCurrentSubscription({ enabled: !isPlanLoading && !isPlanError });
  const storageQuery = useStorageUsage();
  const pricingTrackedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!planId) return;
    const stored = isSubscriptionAnalyticsSource(analyticsSource)
      ? analyticsSource
      : getSubscriptionAnalyticsSource();
    const source = stored === 'other' ? 'settings' : stored;
    const key = `${source}:${planId}`;
    if (pricingTrackedKey.current === key) return;
    pricingTrackedKey.current = key;
    trackSubscriptionPricingViewed({ source, currentPlan: planId });
  }, [analyticsSource, planId]);

  if (isPlanLoading || !planId || !tariff) {
    if (isPlanError) {
      return (
        <div className="flex max-w-md flex-col gap-3">
          <p className="text-text-secondary text-sm">{t('overview.planError')}</p>
          <Button type="button" variant="primary" size="m" onClick={() => void refetchPlan()}>
            {t('overview.retry')}
          </Button>
        </div>
      );
    }

    return <p className="text-text-secondary text-sm">{t('overview.loading')}</p>;
  }

  const subscription = subscriptionQuery.data;
  const endsAt = subscription?.subscription.ends_at;
  const activeSubscription = isSubscriptionPeriodActive(endsAt) ? subscription : null;
  const activeEndsAt = activeSubscription?.subscription.ends_at;
  const locale = getAppLanguage() === 'en' ? 'en-US' : 'ru-RU';
  const remainingDays = activeEndsAt ? getRemainingSubscriptionDays('pro', activeEndsAt) : 0;
  const remainingDaysLabel = t('overview.daysLeftValue', { count: remainingDays });
  const renewalDate = activeEndsAt ? getRenewalHoverDate(activeEndsAt) : null;
  const renewalLabel = formatHoverDate(t('overview.until', { date: '' }).trim(), renewalDate);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-text-secondary flex items-baseline justify-between gap-4 text-sm leading-6">
            <span className="inline-flex items-baseline gap-2">
              <span>{t('overview.currentPlan')}</span>
              <span className="text-text-primary text-base font-semibold">
                {t(`plans.${planId}`)}
              </span>
            </span>
            {activeEndsAt ? (
              <span className="inline-flex items-baseline gap-2">
                <RemainingDays days={remainingDaysLabel} date={renewalLabel} />
                <span aria-hidden="true">·</span>
                <span>
                  {activeSubscription?.auto_renewal
                    ? t('overview.autoRenewOn')
                    : t('overview.autoRenewOff')}
                </span>
              </span>
            ) : null}
          </p>
          {subscriptionQuery.isPending && subscriptionQuery.fetchStatus !== 'idle' ? (
            <span className="text-text-secondary text-sm">{t('overview.loading')}</span>
          ) : null}
          {subscriptionQuery.isError ? (
            <div className="flex flex-col items-start gap-2">
              <span className="text-text-secondary text-sm">{t('overview.subscriptionError')}</span>
              <Button
                type="button"
                variant="ghost"
                size="s"
                className="h-8 px-0"
                onClick={() => void subscriptionQuery.refetch()}
              >
                {t('overview.retry')}
              </Button>
            </div>
          ) : null}
        </div>

        <ClassroomsUsage limit={tariff.maxActiveClassrooms} />

        {storageQuery.isError ? (
          <div className="flex items-center justify-between gap-4">
            <span className="text-text-secondary text-sm">{t('overview.storageError')}</span>
            <Button
              type="button"
              variant="ghost"
              size="s"
              className="h-8 px-0"
              onClick={() => void storageQuery.refetch()}
            >
              {t('overview.retry')}
            </Button>
          </div>
        ) : storageQuery.data ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-secondary flex items-center gap-1 text-sm">
                {t('overview.storage')}
                <StorageInfoHint />
              </span>
              <span className="text-text-primary text-sm font-medium">
                {t('overview.usage', {
                  used: formatPlanStorage(storageQuery.data.total_storage_bytes, planId, locale),
                  total: formatPlanStorage(tariff.storageBytes, planId, locale),
                })}
              </span>
            </div>
            <UsageBar used={storageQuery.data.total_storage_bytes} total={tariff.storageBytes} />
          </div>
        ) : (
          <span className="text-text-secondary text-sm">{t('overview.loading')}</span>
        )}
      </section>

      <section className="bg-background-subtle flex flex-col items-start gap-2 rounded-2xl px-4 py-3">
        <p className="text-text-secondary text-sm">{t('overview.plansDetails')}</p>
        <Link
          href={SOVLIUM_PRICES_URL}
          target="_blank"
          rel="noreferrer"
          size="s"
          className="text-text-link"
          data-umami-event="outbound-link-click"
          data-umami-event-url={SOVLIUM_PRICES_URL}
          data-umami-event-type="prices"
        >
          {t('overview.landing')}
        </Link>
      </section>

      {isBasic && subscriptionQuery.isSuccess && !activeSubscription ? <ProTrialBanner /> : null}
      <PromoCodeField />
    </div>
  );
};
