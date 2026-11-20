import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Close } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { useCurrentSubscription } from 'common.services';
import {
  isSubscriptionExpiryNoticeDue,
  SUBSCRIPTION_EXPIRY_NOTICE_WINDOW_MS,
  useSubscriptionUiStore,
} from 'common.subscription';
import { formatInAppTimeZone, getDateLocale } from 'common.ui';
import {
  PRODUCT_ANALYTICS_EVENTS,
  setSubscriptionAnalyticsSource,
  trackOnce,
  trackProductEvent,
} from 'common.utils';
import { useTranslation } from 'react-i18next';
import { useMenuStore } from '../store';
import { useSettingsSearch } from './useSettingsSearch';

const DISMISS_STORAGE_KEY = 'navigation.subscription-expiry-notice.dismissed';

const cardClassName =
  'border-yellow-100 bg-status-warning-background text-status-warning-text relative rounded-2xl border p-3';

const readDismissedEndsAt = () => {
  try {
    return localStorage.getItem(DISMISS_STORAGE_KEY);
  } catch {
    return null;
  }
};

const hoursLeft = (endsAt: string, now: number) => {
  const end = new Date(endsAt).getTime();
  if (!Number.isFinite(end)) return 0;
  return Math.max(1, Math.ceil((end - now) / (60 * 60 * 1000)));
};

const formatEndsAt = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const dayMonth = formatInAppTimeZone(date, { day: 'numeric', month: 'long' }, getDateLocale());
  const year = formatInAppTimeZone(date, { year: 'numeric' }, 'en-US');
  return `${dayMonth} ${year}`;
};

const useNoticeNow = (endsAt: string | undefined, autoRenewalEnabled: boolean) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!endsAt || autoRenewalEnabled) return;

    const end = new Date(endsAt).getTime();
    if (!Number.isFinite(end)) return;

    const showAt = end - SUBSCRIPTION_EXPIRY_NOTICE_WINDOW_MS;
    const target = now < showAt ? showAt : now < end ? end : null;
    if (target === null) return;

    const delay = target - Date.now();
    if (delay <= 0) {
      setNow(Date.now());
      return;
    }

    const timer = window.setTimeout(() => setNow(Date.now()), delay);
    return () => window.clearTimeout(timer);
  }, [autoRenewalEnabled, endsAt, now]);

  return now;
};

const SubscriptionExpiryNoticeCard = ({
  className,
  description,
  onDismiss,
  onRenew,
}: {
  className?: string;
  description: string;
  onDismiss: () => void;
  onRenew: () => void;
}) => {
  const { t } = useTranslation('navigation');

  return (
    <div className={cn(cardClassName, className)} role="status">
      <div className="flex items-start justify-between gap-2">
        <p className="text-s-base pt-0.5 font-semibold">{t('subscriptionExpiry.title')}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t('subscriptionExpiry.dismiss')}
          className="bg-status-warning-background hover:bg-status-warning-background focus:bg-status-warning-background active:bg-status-warning-background -mt-1 -mr-1 flex size-6 shrink-0 items-center justify-center rounded-lg"
        >
          <Close className="size-4 text-yellow-100!" />
        </button>
      </div>
      <p className="text-xs-base mt-1 leading-snug">{description}</p>
      <button
        type="button"
        onClick={onRenew}
        className="text-status-warning-text text-xs-base bg-background-surface hover:bg-yellow-20 mt-2 inline-flex h-7 cursor-pointer items-center self-start rounded-lg border border-yellow-100 px-2.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-100"
      >
        {t('subscriptionExpiry.renew')}
      </button>
    </div>
  );
};

const CollapsedSubscriptionExpiryNotice = ({
  description,
  onDismiss,
  onRenew,
}: {
  description: string;
  onDismiss: () => void;
  onRenew: () => void;
}) => {
  const { t } = useTranslation('navigation');
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('subscriptionExpiry.title')}
          className="bg-status-warning-background text-m-base hidden size-10 shrink-0 items-center justify-center rounded-2xl border border-yellow-100 font-semibold text-yellow-100 group-data-[collapsible=icon]:flex"
        >
          !
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        sideOffset={12}
        className="z-50 w-[240px] rounded-2xl border-0 bg-transparent p-0 shadow-none"
      >
        <SubscriptionExpiryNoticeCard
          description={description}
          onRenew={() => {
            setOpen(false);
            onRenew();
          }}
          onDismiss={() => {
            setOpen(false);
            onDismiss();
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export const SubscriptionExpiryNotice = ({
  className,
  collapsedFallback = true,
  onNavigate,
}: {
  className?: string;
  collapsedFallback?: boolean;
  onNavigate?: () => void;
}) => {
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();
  const settingsSearch = useSettingsSearch();
  const closeMenu = useMenuStore((state) => state.close);
  const { data: subscription } = useCurrentSubscription();
  const endsAt = subscription?.subscription.ends_at;
  const autoRenewalEnabled = Boolean(subscription?.auto_renewal);
  const now = useNoticeNow(endsAt, autoRenewalEnabled);
  const [dismissedEndsAt, setDismissedEndsAt] = useState(readDismissedEndsAt);

  const due = isSubscriptionExpiryNoticeDue(endsAt, autoRenewalEnabled, now);
  const visible = due && Boolean(endsAt) && dismissedEndsAt !== endsAt;

  useEffect(() => {
    if (!visible || !endsAt) return;
    trackOnce(`subscription_expiry_notice_shown:${endsAt}`, () => {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_EXPIRY_NOTICE_SHOWN, {
        hours_left: hoursLeft(endsAt, Date.now()),
      });
    });
  }, [endsAt, visible]);

  if (!visible || !endsAt) return null;

  const formattedDate = formatEndsAt(endsAt);
  const description = formattedDate
    ? t('subscriptionExpiry.description', { date: formattedDate })
    : t('subscriptionExpiry.descriptionNoDate');

  const dismiss = () => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_EXPIRY_NOTICE_DISMISSED, {
      hours_left: hoursLeft(endsAt, Date.now()),
    });
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, endsAt);
    } catch {
      // Уведомление скроется в этой сессии, даже если хранилище недоступно.
    }
    setDismissedEndsAt(endsAt);
  };

  const renew = () => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_EXPIRY_NOTICE_RENEW_CLICKED, {
      hours_left: hoursLeft(endsAt, Date.now()),
    });
    setSubscriptionAnalyticsSource('expiry_notice');
    useSubscriptionUiStore.getState().setAnalyticsSource('expiry_notice');
    onNavigate?.();
    closeMenu();
    void navigate({
      to: '/settings/$section',
      params: { section: 'subscription' },
      search: settingsSearch,
    });
  };

  return (
    <>
      <SubscriptionExpiryNoticeCard
        className={cn(collapsedFallback && 'group-data-[collapsible=icon]:hidden', className)}
        description={description}
        onDismiss={dismiss}
        onRenew={renew}
      />
      {collapsedFallback ? (
        <CollapsedSubscriptionExpiryNotice
          description={description}
          onDismiss={dismiss}
          onRenew={renew}
        />
      ) : null}
    </>
  );
};
