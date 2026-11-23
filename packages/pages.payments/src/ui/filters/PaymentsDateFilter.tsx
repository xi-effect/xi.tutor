import { useEffect, useState, type PointerEvent, type SyntheticEvent } from 'react';
import { Button } from '@xipkg/button';
import { DatePicker } from '@xipkg/datepicker';
import { Calendar, Close } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { PaymentsFilterActions, PaymentsFilterChip } from './filterControls';
import { paymentsFilterPopoverClass, paymentsFilterPopoverProps } from './paymentsFilterState';

type DateDraft = {
  from: string;
  to: string;
};

type PaymentsDateFilterProps = {
  from: string;
  to: string;
  onChange: (value: DateDraft) => void;
};

const DATE_PICKER_POPOVER_CLASS =
  'payments-date-calendar dark:bg-background-surface border-border-default w-max max-w-[calc(100vw-32px)] min-w-0 rounded-lg border p-0 shadow-lg';

const isInvertedRange = (from: string, to: string) => Boolean(from && to && from > to);

const parseCalendarDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return undefined;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (date.getFullYear() !== Number(match[1]) || date.getMonth() !== Number(match[2]) - 1) {
    return undefined;
  }

  return date;
};

const formatCalendarDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const isNestedCalendarEvent = (event: SyntheticEvent | { target: EventTarget | null }) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return false;
  }

  if (target.closest('.payments-date-calendar')) {
    return true;
  }

  return Boolean(
    target.closest('[data-radix-popper-content-wrapper]')?.querySelector('.payments-date-calendar'),
  );
};

const keepFilterOpen = (event: { target: EventTarget | null; preventDefault: () => void }) => {
  if (isNestedCalendarEvent(event)) {
    event.preventDefault();
  }
};

type PaymentsDateFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  clearLabel: string;
  minDate?: Date;
  maxDate?: Date;
  onChange: (value: string) => void;
};

const PaymentsDateField = ({
  label,
  value,
  placeholder,
  clearLabel,
  minDate,
  maxDate,
  onChange,
}: PaymentsDateFieldProps) => {
  const { i18n } = useTranslation('payments');
  const selected = parseCalendarDate(value);
  const disabled = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  const handleClear = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onChange('');
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-s-base text-text-secondary">{label}</span>
      <div className="relative w-full">
        <DatePicker
          calendarProps={{
            mode: 'single',
            selected,
            onSelect: (date) => onChange(date ? formatCalendarDate(date) : ''),
            required: false,
            disabled: disabled.length > 0 ? disabled : undefined,
          }}
          classNamePopoverContent={DATE_PICKER_POPOVER_CLASS}
          popoverContentProps={{ side: 'bottom', align: 'start', collisionPadding: 16 }}
        >
          <Button
            type="button"
            variant="text"
            size="s"
            className={cn(
              'border-border-default hover:bg-background-page text-text-primary w-full min-w-0 cursor-pointer justify-start gap-2 rounded-lg border bg-transparent px-3 py-2 text-left text-sm font-normal normal-case',
              selected && 'pr-9',
            )}
          >
            {selected ? (
              <span className="min-w-0 truncate">
                {selected.toLocaleDateString(i18n.language, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            ) : (
              <span className="text-text-disabled truncate">{placeholder}</span>
            )}
            {selected ? null : <Calendar className="fill-icon-brand ml-auto h-4 w-4 shrink-0" />}
          </Button>
        </DatePicker>
        {selected ? (
          <button
            type="button"
            aria-label={clearLabel}
            className="absolute top-1/2 right-3 z-10 flex size-4 -translate-y-1/2 cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0 shadow-none outline-none"
            onPointerDown={handleClear}
          >
            <Close className="fill-icon-secondary hover:fill-icon-primary pointer-events-none size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export const PaymentsDateFilter = ({ from, to, onChange }: PaymentsDateFilterProps) => {
  const { t } = useTranslation('payments');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateDraft>({ from, to });
  const count = Number(Boolean(from)) + Number(Boolean(to));
  const inverted = isInvertedRange(draft.from, draft.to);

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
          data-umami-event="payments-date-filter"
        >
          {count > 0 ? t('filters.dateChipCount', { count }) : t('filters.dateChip')}
        </PaymentsFilterChip>
      </PopoverTrigger>
      <PopoverContent
        {...paymentsFilterPopoverProps}
        className={paymentsFilterPopoverClass}
        onInteractOutside={keepFilterOpen}
        onPointerDownOutside={keepFilterOpen}
        onFocusOutside={keepFilterOpen}
      >
        <div className="flex w-full flex-col gap-3">
          <PaymentsDateField
            label={t('filters.from')}
            value={draft.from}
            placeholder={t('filters.datePlaceholder')}
            clearLabel={t('filters.dateClear')}
            maxDate={parseCalendarDate(draft.to)}
            onChange={(next) => setDraft((current) => ({ ...current, from: next }))}
          />
          <PaymentsDateField
            label={t('filters.to')}
            value={draft.to}
            placeholder={t('filters.datePlaceholder')}
            clearLabel={t('filters.dateClear')}
            minDate={parseCalendarDate(draft.from)}
            onChange={(next) => setDraft((current) => ({ ...current, to: next }))}
          />
          <p className="text-xs-base text-text-secondary">{t('filters.dateHint')}</p>
          {inverted ? (
            <p className="text-status-error-text text-xs">{t('filters.dateInvalid')}</p>
          ) : null}
        </div>
        <PaymentsFilterActions
          canReset={Boolean(draft.from || draft.to)}
          canApply={!inverted}
          onReset={() => setDraft({ from: '', to: '' })}
          onApply={() => {
            onChange(draft);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
