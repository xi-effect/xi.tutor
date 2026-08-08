import { memo, useCallback, useEffect, useState } from 'react';

import { Button } from '@xipkg/button';
import { DatePicker } from '@xipkg/datepicker';
import { Calendar } from '@xipkg/icons';
import { getShortDateString } from '../../utils';

const DATE_PICKER_POPOVER_CLASS =
  'dark:bg-background-surface border-border-default min-w-[280px] rounded-lg border p-0 shadow-lg';

interface InputDateProps {
  value?: Date;
  onChange: (val: Date) => void;
}

export const InputDate = memo<InputDateProps>(({ value, onChange }) => {
  const [date, setDate] = useState<Date>(value || new Date());

  const handleSelectDate = useCallback(
    (newDate: Date | undefined) => {
      if (!newDate) return;
      setDate(newDate);
      onChange(newDate);
    },
    [onChange],
  );

  useEffect(() => {
    if (value) {
      setDate(value);
    }
  }, [value]);

  return (
    <DatePicker
      calendarProps={{ mode: 'single', selected: date, onSelect: handleSelectDate, required: true }}
      classNamePopoverContent={DATE_PICKER_POPOVER_CLASS}
      popoverContentProps={{ side: 'bottom', align: 'start' }}
    >
      <Button
        type="button"
        variant="text"
        size="s"
        className="border-border-default hover:bg-background-page text-text-primary w-full cursor-pointer justify-start gap-2 rounded-lg border bg-transparent px-3 py-2 text-left text-sm font-normal normal-case"
      >
        {getShortDateString(date)}
        <Calendar className="fill-icon-brand ml-auto h-4 w-4 shrink-0" />
      </Button>
    </DatePicker>
  );
});
