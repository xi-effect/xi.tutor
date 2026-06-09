import { memo, useCallback, useEffect, useState } from 'react';

import { Button } from '@xipkg/button';
import { DatePicker } from '@xipkg/datepicker';
import { Calendar } from '@xipkg/icons';
import { getShortDateString } from '../../utils';

const DATE_PICKER_POPOVER_CLASS =
  'dark:bg-gray-0 border-gray-10 min-w-[280px] rounded-lg border p-0 shadow-lg';

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
        className="border-gray-10 hover:bg-gray-5 w-full cursor-pointer justify-start gap-2 rounded-lg border bg-transparent px-3 py-2 text-left text-sm font-normal text-gray-100 normal-case"
      >
        {getShortDateString(date)}
        <Calendar className="fill-brand-80 ml-auto h-4 w-4 shrink-0" />
      </Button>
    </DatePicker>
  );
});
