import { InvoiceCardTypeT } from 'common.types';
import { Check } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';

export const PaymentApproveButtonContent = ({ type }: { type: InvoiceCardTypeT }) => {
  const { t } = useTranslation('paymentApprove');

  if (type === 'default')
    return (
      <span className="text-s-base text-text-secondary font-medium">{t('actions.confirm')}</span>
    );

  return (
    <>
      <span className="text-s-base text-text-link hidden font-medium md:block">
        {t('actions.confirm')}
      </span>
      <Check className="fill-icon-brand block md:hidden" />
    </>
  );
};
