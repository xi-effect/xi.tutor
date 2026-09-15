import { memo, useCallback, type PointerEvent } from 'react';

import { Button } from '@xipkg/button';
import { DatePicker } from '@xipkg/datepicker';
import { Calendar, Close } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { getShortDateString } from '../../utils';

const DATE_PICKER_POPOVER_CLASS =
  'dark:bg-background-surface border-border-default min-w-[280px] rounded-lg border p-0 shadow-lg';

type InputDateProps = {
  value?: Date | null;
  onChange: (val: Date | null) => void;
  /** Даты раньше этой недоступны в календаре */
  minDate?: Date;
  placeholder?: string;
  /** Пустое значение допустимо (нет выбранной даты) */
  allowEmpty?: boolean;
};

export const InputDate = memo<InputDateProps>(
  ({ value, onChange, minDate, placeholder, allowEmpty = false }) => {
    const handleSelectDate = useCallback(
      (newDate: Date | undefined) => {
        if (!newDate) {
          if (allowEmpty) onChange(null);
          return;
        }
        onChange(newDate);
      },
      [allowEmpty, onChange],
    );

    const handleClear = useCallback(
      (event: PointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        onChange(null);
      },
      [onChange],
    );

    const showClear = Boolean(allowEmpty && value);

    return (
      <div className="relative w-full">
        <DatePicker
          calendarProps={{
            mode: 'single',
            selected: value ?? undefined,
            onSelect: handleSelectDate,
            required: !allowEmpty,
            disabled: minDate
              ? { before: new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) }
              : undefined,
          }}
          classNamePopoverContent={DATE_PICKER_POPOVER_CLASS}
          popoverContentProps={{ side: 'bottom', align: 'start' }}
        >
          <Button
            type="button"
            variant="text"
            size="s"
            className={cn(
              'border-border-default hover:bg-background-page text-text-primary w-full cursor-pointer justify-start gap-2 rounded-lg border bg-transparent px-3 py-2 text-left text-sm font-normal normal-case',
              showClear && 'pr-9',
            )}
          >
            {value ? (
              getShortDateString(value)
            ) : (
              <span className="text-text-disabled">{placeholder}</span>
            )}
            {!showClear ? <Calendar className="fill-icon-brand ml-auto h-4 w-4 shrink-0" /> : null}
          </Button>
        </DatePicker>
        {showClear ? (
          <button
            type="button"
            aria-label={placeholder}
            className="absolute top-1/2 right-3 z-10 flex size-4 -translate-y-1/2 cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0 shadow-none outline-none"
            onPointerDown={handleClear}
          >
            <Close className="fill-icon-secondary hover:fill-icon-primary pointer-events-none size-4" />
          </button>
        ) : null}
      </div>
    );
  },
);
