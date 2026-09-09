import { InfoCircle } from '@xipkg/icons';
import { useSubscriptionPlan, type YookassaSavedCardUiUser } from 'common.subscription';
import { useTranslation } from 'react-i18next';
import { PaymentMethodSettings } from './PaymentMethodSettings';

export const SubscriptionOverview = ({ user }: { user?: YookassaSavedCardUiUser }) => {
  const { t } = useTranslation('subscription');
  const { planId } = useSubscriptionPlan();

  return (
    <div className="flex flex-col gap-6">
      <div
        role="status"
        className="bg-status-info-background flex w-full items-start gap-3 rounded-2xl px-4 py-3"
      >
        <InfoCircle className="fill-icon-brand mt-0.5 size-5 shrink-0" />
        <p className="text-text-link text-sm leading-5">{t('launchBanner')}</p>
      </div>

      <section className="border-border-strong flex flex-col gap-3 rounded-2xl border p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-secondary text-sm">{t('overview.currentPlan')}</span>
          <span className="text-text-primary text-sm font-medium">{t(`plans.${planId}`)}</span>
        </div>
      </section>

      <PaymentMethodSettings user={user} />
    </div>
  );
};
