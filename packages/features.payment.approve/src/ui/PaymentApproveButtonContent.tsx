import { InvoiceCardTypeT } from 'common.types';
import { Check } from '@xipkg/icons';

export const PaymentApproveButtonContent = ({ type }: { type: InvoiceCardTypeT }) => {
  if (type === 'default')
    return <span className="text-s-base text-brand-100 font-medium">Подтвердить</span>;

  return (
    <>
      <span className="text-s-base text-brand-100 hidden font-medium md:block">Подтвердить</span>
      <Check className="fill-brand-100 block md:hidden" />
    </>
  );
};
