import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { useTranslation } from 'react-i18next';
import { PaymentsFilterActions, PaymentsFilterChip, PaymentsFilterOption } from './filterControls';
import {
  paymentsFilterPopoverClass,
  paymentsFilterPopoverProps,
  type InvoicePaymentTypeChoice,
} from './paymentsFilterState';

const PAYMENT_TYPE_CHOICES: InvoicePaymentTypeChoice[] = ['cash', 'transfer', 'unpaid'];

type PaymentsPaymentTypeFilterProps = {
  value: InvoicePaymentTypeChoice[];
  onChange: (paymentTypes: InvoicePaymentTypeChoice[]) => void;
};

export const PaymentsPaymentTypeFilter = ({ value, onChange }: PaymentsPaymentTypeFilterProps) => {
  const { t } = useTranslation('payments');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<InvoicePaymentTypeChoice[]>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const togglePaymentType = (paymentType: InvoicePaymentTypeChoice) => {
    setDraft((current) =>
      current.includes(paymentType)
        ? current.filter((item) => item !== paymentType)
        : [...current, paymentType],
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PaymentsFilterChip
          open={open}
          selected={value.length > 0}
          data-umami-event="payments-payment-type-filter"
        >
          {value.length > 0
            ? t('filters.paymentTypeChipCount', { count: value.length })
            : t('filters.paymentTypeChip')}
        </PaymentsFilterChip>
      </PopoverTrigger>
      <PopoverContent {...paymentsFilterPopoverProps} className={paymentsFilterPopoverClass}>
        <div className="flex w-full flex-col items-stretch gap-3 bg-transparent">
          {PAYMENT_TYPE_CHOICES.map((paymentType) => (
            <PaymentsFilterOption
              key={paymentType}
              selected={draft.includes(paymentType)}
              onSelect={() => togglePaymentType(paymentType)}
              umamiEvent="payments-payment-type-filter-option"
              umamiScope={paymentType}
            >
              {t(`filters.paymentType.${paymentType}`)}
            </PaymentsFilterOption>
          ))}
        </div>
        <PaymentsFilterActions
          canReset={draft.length > 0}
          onReset={() => setDraft([])}
          onApply={() => {
            onChange(draft);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
