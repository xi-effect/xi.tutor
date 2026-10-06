import { useState } from 'react';
import { Button } from '@xipkg/button';
import { useCurrentSubscription, useDeleteAutoRenewal } from 'common.services';
import { ConfirmDialog } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { formatRenewalDateShort } from '../utils/dates';

export const CancelSubscriptionButton = ({ buttonClassName }: { buttonClassName?: string }) => {
  const { t } = useTranslation('subscription');
  const subscriptionQuery = useCurrentSubscription();
  const deleteAutoRenewal = useDeleteAutoRenewal();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState(false);
  const subscription = subscriptionQuery.data;
  const endsAt = subscription?.subscription.ends_at;
  const autoRenewal = Boolean(subscription?.auto_renewal);
  const description = endsAt
    ? t('manage.disableDescriptionRenewal', { date: formatRenewalDateShort(endsAt) })
    : t('manage.disableDescriptionRenewalNoDate');

  if (!subscription) return null;

  if (!autoRenewal) {
    return (
      <div className="text-text-secondary flex flex-col items-center gap-1 text-center text-sm leading-5">
        <p>{t('manage.noRenewalHint')}</p>
        <p>
          {endsAt
            ? t('manage.noRenewalUntil', { date: formatRenewalDateShort(endsAt) })
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
      {error ? <p className="text-status-error-text text-sm">{t('manage.disableError')}</p> : null}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('manage.disableTitle')}
        description={description}
        confirmLabel={t('manage.disableConfirm')}
        cancelLabel={t('manage.disableKeep')}
        isPending={deleteAutoRenewal.isPending}
        onConfirm={() => {
          deleteAutoRenewal.mutate(undefined, {
            onSuccess: () => setError(false),
            onError: () => setError(true),
          });
        }}
      />
    </div>
  );
};
