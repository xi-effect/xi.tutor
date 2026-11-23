import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { PAYMENT_STATUSES, type InvoicePaymentStatus } from 'common.api';
import { useTranslation } from 'react-i18next';
import { PaymentsFilterActions, PaymentsFilterChip, PaymentsFilterOption } from './filterControls';
import { paymentsFilterPopoverClass, paymentsFilterPopoverProps } from './paymentsFilterState';

type PaymentsStatusFilterProps = {
  value: InvoicePaymentStatus[];
  onChange: (statuses: InvoicePaymentStatus[]) => void;
};

export const PaymentsStatusFilter = ({ value, onChange }: PaymentsStatusFilterProps) => {
  const { t } = useTranslation('payments');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<InvoicePaymentStatus[]>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const toggleStatus = (status: InvoicePaymentStatus) => {
    setDraft((current) =>
      current.includes(status) ? current.filter((item) => item !== status) : [...current, status],
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PaymentsFilterChip
          open={open}
          selected={value.length > 0}
          data-umami-event="payments-status-filter"
        >
          {value.length > 0
            ? t('filters.statusChipCount', { count: value.length })
            : t('filters.statusChip')}
        </PaymentsFilterChip>
      </PopoverTrigger>
      <PopoverContent {...paymentsFilterPopoverProps} className={paymentsFilterPopoverClass}>
        <div className="flex w-full flex-col items-stretch gap-3 bg-transparent">
          {PAYMENT_STATUSES.map((status) => (
            <PaymentsFilterOption
              key={status}
              selected={draft.includes(status)}
              onSelect={() => toggleStatus(status)}
              umamiEvent="payments-status-filter-option"
              umamiScope={status}
            >
              {t(`filters.status.${status}`)}
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
