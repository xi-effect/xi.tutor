import { InvoiceCardTypeT } from 'common.types';
import { Check } from '@xipkg/icons';

export const PaymentApproveButtonContent = ({ type }: { type: InvoiceCardTypeT }) => {
  if (type === 'default')
    return <span className="text-s-base text-text-secondary font-medium">Подтвердить</span>;

  return (
    <>
      <span className="text-s-base text-text-link hidden font-medium md:block">Подтвердить</span>
      <Check className="fill-icon-brand block md:hidden" />
    </>
  );
};
