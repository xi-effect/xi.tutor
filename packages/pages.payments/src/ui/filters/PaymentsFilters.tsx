import { Button } from '@xipkg/button';
import { type InvoicePaymentStatus } from 'common.api';
import { cn, useMediaQuery } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { PaymentsAmountFilter } from './PaymentsAmountFilter';
import { PaymentsDateFilter } from './PaymentsDateFilter';
import { PaymentsPaymentTypeFilter } from './PaymentsPaymentTypeFilter';
import { PaymentsPeopleFilter } from './PaymentsPeopleFilter';
import { PaymentsStatusFilter } from './PaymentsStatusFilter';
import {
  hasPaymentsFilters,
  type InvoicePaymentTypeChoice,
  type PaymentsFiltersState,
} from './paymentsFilterState';

type PaymentsFiltersProps = {
  isTutor: boolean;
  value: PaymentsFiltersState;
  onChange: (filters: PaymentsFiltersState) => void;
};

export const PaymentsFilters = ({ isTutor, value, onChange }: PaymentsFiltersProps) => {
  const { t } = useTranslation('payments');
  const isMobile = useMediaQuery('(max-width: 960px)');
  const hasFilters = hasPaymentsFilters(value);

  const patch = (next: Partial<PaymentsFiltersState>) => {
    onChange({ ...value, ...next });
  };

  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-3',
        isMobile
          ? '-mx-5 [scrollbar-width:none] flex-nowrap overflow-x-auto px-5 py-1 [&::-webkit-scrollbar]:hidden'
          : 'flex-wrap',
      )}
    >
      <PaymentsStatusFilter
        value={value.statuses}
        onChange={(statuses: InvoicePaymentStatus[]) => patch({ statuses })}
      />
      <PaymentsPaymentTypeFilter
        value={value.paymentTypes}
        onChange={(paymentTypes: InvoicePaymentTypeChoice[]) => patch({ paymentTypes })}
      />
      <PaymentsDateFilter
        from={value.createdFrom}
        to={value.createdTo}
        onChange={({ from, to }) => patch({ createdFrom: from, createdTo: to })}
      />
      <PaymentsAmountFilter
        from={value.totalFrom}
        to={value.totalTo}
        onChange={({ from, to }) => patch({ totalFrom: from, totalTo: to })}
      />
      <PaymentsPeopleFilter
        isTutor={isTutor}
        value={value.counterpartyIds}
        onChange={(counterpartyIds) => patch({ counterpartyIds })}
      />
      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          className="text-s-base text-text-link hover:text-text-link h-auto px-2 py-1 font-medium"
          onClick={() =>
            onChange({
              statuses: [],
              paymentTypes: [],
              createdFrom: '',
              createdTo: '',
              totalFrom: '',
              totalTo: '',
              counterpartyIds: [],
            })
          }
          data-umami-event="payments-filters-reset-all"
        >
          {t('filters.resetAll')}
        </Button>
      ) : null}
    </div>
  );
};
