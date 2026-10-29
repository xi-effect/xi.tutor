import { useEffect, useState } from 'react';
import { Button } from '@xipkg/button';
import { isSubscriptionPeriodActive } from 'common.subscription';
import {
  useCurrentSubscription,
  useDeleteAutoRenewal,
  useMonetizationDevStore,
} from 'common.services';
import { ConfirmDialog, useAppTimeZone } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { formatRenewalDate } from '../utils/dates';

export const CancelSubscriptionButton = ({ buttonClassName }: { buttonClassName?: string }) => {
  const { t } = useTranslation('subscription');
  useAppTimeZone();
  const subscriptionQuery = useCurrentSubscription();
  const deleteAutoRenewal = useDeleteAutoRenewal();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState(false);
  const subscription = subscriptionQuery.data;
  const endsAt = subscription?.subscription.ends_at;
  const activeSubscription = isSubscriptionPeriodActive(endsAt) ? subscription : null;
  const activeEndsAt = activeSubscription?.subscription.ends_at;
  const autoRenewal = Boolean(activeSubscription?.auto_renewal);
  const description = activeEndsAt
    ? t('manage.disableDescriptionRenewal', { date: formatRenewalDate(activeEndsAt) })
    : t('manage.disableDescriptionRenewalNoDate');
  const cancelDialogRequested = useMonetizationDevStore(
    (state) => state.override.cancelDialogRequested,
  );
  const subscriptionOverridden = useMonetizationDevStore(
    (state) => state.override.enabled && state.override.subscription !== 'real',
  );
  const consumeCancelDialog = useMonetizationDevStore((state) => state.consumeCancelDialog);
  const patchOverride = useMonetizationDevStore((state) => state.patchOverride);

  useEffect(() => {
    if (!cancelDialogRequested || !autoRenewal) return;
    consumeCancelDialog();
    setConfirmOpen(true);
  }, [autoRenewal, cancelDialogRequested, consumeCancelDialog]);

  if (!activeSubscription) return null;

  if (!autoRenewal) {
    return (
      <div className="text-text-secondary flex flex-col items-center gap-1 text-center text-sm leading-5">
        <p>{t('manage.noRenewalHint')}</p>
        <p>
          {activeEndsAt
            ? t('manage.noRenewalUntil', { date: formatRenewalDate(activeEndsAt) })
            : t('manage.noRenewalUntilNoDate')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        variant="ghost"
        size="m"
        className={buttonClassName ?? 'text-text-danger h-8 self-start px-0'}
        onClick={() => {
          setError(false);
          setConfirmOpen(true);
        }}
        disabled={deleteAutoRenewal.isPending}
      >
        {t('manage.disable')}
      </Button>
      {error ? (
        <p className="text-status-error-text text-sm" role="alert">
          {t('manage.disableError')}
        </p>
      ) : null}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('manage.disableTitle')}
        description={description}
        confirmLabel={t('manage.disableConfirm')}
        cancelLabel={t('manage.disableKeep')}
        isPending={deleteAutoRenewal.isPending}
        onConfirm={() => {
          if (subscriptionOverridden) {
            patchOverride({ autoRenewal: false });
            setError(false);
            setConfirmOpen(false);
            return;
          }

          deleteAutoRenewal.mutate(undefined, {
            onSuccess: () => setError(false),
            onError: () => setError(true),
          });
        }}
      />
    </div>
  );
};
