import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { Input } from '@xipkg/input';
import { canonicalInvoiceTotal } from 'common.api';
import { useTranslation } from 'react-i18next';
import { PaymentsFilterActions, PaymentsFilterChip } from './filterControls';
import { paymentsFilterPopoverClass, paymentsFilterPopoverProps } from './paymentsFilterState';

type AmountDraft = {
  from: string;
  to: string;
};

type PaymentsAmountFilterProps = {
  from: string;
  to: string;
  onChange: (value: AmountDraft) => void;
};

const normalizeDraftValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  return canonicalInvoiceTotal(trimmed) ?? null;
};

export const PaymentsAmountFilter = ({ from, to, onChange }: PaymentsAmountFilterProps) => {
  const { t } = useTranslation('payments');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AmountDraft>({ from, to });
  const count = Number(Boolean(from)) + Number(Boolean(to));
  const normalizedFrom = normalizeDraftValue(draft.from);
  const normalizedTo = normalizeDraftValue(draft.to);
  const invalidFormat = normalizedFrom === null || normalizedTo === null;
  const inverted =
    typeof normalizedFrom === 'string' &&
    typeof normalizedTo === 'string' &&
    Number(normalizedFrom) > Number(normalizedTo);

  useEffect(() => {
    if (open) {
      setDraft({ from, to });
    }
  }, [open, from, to]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PaymentsFilterChip
          open={open}
          selected={count > 0}
          data-umami-event="payments-amount-filter"
        >
          {count > 0 ? t('filters.amountChipCount', { count }) : t('filters.amountChip')}
        </PaymentsFilterChip>
      </PopoverTrigger>
      <PopoverContent {...paymentsFilterPopoverProps} className={paymentsFilterPopoverClass}>
        <div className="flex w-full flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-s-base text-text-secondary">{t('filters.from')}</span>
            <Input
              type="text"
              inputMode="decimal"
              value={draft.from}
              placeholder="0"
              onChange={(event) =>
                setDraft((current) => ({ ...current, from: event.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-s-base text-text-secondary">{t('filters.to')}</span>
            <Input
              type="text"
              inputMode="decimal"
              value={draft.to}
              placeholder="0"
              onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value }))}
            />
          </label>
          <p className="text-xs-base text-text-secondary">{t('filters.amountHint')}</p>
          {invalidFormat || inverted ? (
            <p className="text-status-error-text text-xs">{t('filters.amountInvalid')}</p>
          ) : null}
        </div>
        <PaymentsFilterActions
          canReset={Boolean(draft.from || draft.to)}
          canApply={!invalidFormat && !inverted}
          onReset={() => setDraft({ from: '', to: '' })}
          onApply={() => {
            onChange({
              from: normalizedFrom ?? '',
              to: normalizedTo ?? '',
            });
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
