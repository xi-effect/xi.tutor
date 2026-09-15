import { useState } from 'react';
import { Button } from '@xipkg/button';
import {
  formatRub,
  useSubscriptionPlan,
  useSubscriptionStore,
  useSubscriptionUiStore,
} from 'common.subscription';
import { ConfirmDialog, getAppLanguage } from 'common.ui';
import { useTranslation } from 'react-i18next';
import { formatRenewalDate, formatRenewalDateShort } from '../utils/dates';
import { PromoCodeField } from './PromoCodeField';
import { ScreenBackButton } from './ScreenBackButton';

export const SubscriptionManage = () => {
  const { t } = useTranslation('subscription');
  const locale = getAppLanguage() === 'en' ? 'en-US' : 'ru-RU';
  const { planId, tariff, autoRenew, renewsAt, remainingDays } = useSubscriptionPlan();
  const setAutoRenew = useSubscriptionStore((s) => s.setAutoRenew);
  const openOverview = useSubscriptionUiStore((s) => s.openOverview);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const price = t('price.monthly', { price: formatRub(tariff.priceMonthlyRub, locale) });

  return (
    <div className="flex flex-col gap-6">
      <ScreenBackButton onClick={openOverview} />
      <span className="text-text-primary text-3xl font-semibold max-sm:hidden">
        {t('manage.title')}
      </span>

      <section className="border-border-strong flex flex-col gap-3 rounded-2xl border p-4">
        <Row label={t('manage.plan')} value={t(`plans.${planId}`)} />
        <Row label={t('manage.price')} value={price} />
        <Row label={t('manage.nextRenewal')} value={formatRenewalDate(renewsAt)} />
        <Row
          label={t('manage.daysLeftLabel')}
          value={t('manage.daysLeftValue', { count: remainingDays })}
        />
        <Row label={autoRenew ? t('manage.autoRenewOn') : t('manage.autoRenewOff')} value="" />
      </section>

      <PromoCodeField />

      {autoRenew ? (
        <Button
          type="button"
          variant="ghost"
          size="m"
          className="text-text-danger h-12 w-full rounded-xl"
          onClick={() => setConfirmOpen(true)}
        >
          {t('manage.disable')}
        </Button>
      ) : (
        <Button
          type="button"
          variant="primary"
          size="m"
          className="h-12 w-full rounded-xl font-medium"
          onClick={() => setAutoRenew(true)}
        >
          {t('manage.resume')}
        </Button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('manage.disableTitle')}
        description={t('manage.disableDescription', { date: formatRenewalDateShort(renewsAt) })}
        confirmLabel={t('manage.disableConfirm')}
        cancelLabel={t('manage.cancel')}
        onConfirm={() => setAutoRenew(false)}
      />
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-text-secondary text-sm">{label}</span>
    {value ? <span className="text-text-primary text-sm font-medium">{value}</span> : null}
  </div>
);
