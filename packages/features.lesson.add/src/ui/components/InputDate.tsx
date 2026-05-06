import { memo, useCallback, useEffect, useState } from 'react';

import { Button } from '@xipkg/button';
import { DatePicker } from '@xipkg/datepicker';
import { Calendar } from '@xipkg/icons';
import { getShortDateString } from '../../utils';

interface InputDateProps {
  value?: Date;
  onChange: (val: Date) => void;
}

export const InputDate = memo<InputDateProps>(({ value, onChange }) => {
  const [date, setDate] = useState<Date>(value || new Date());

  const handleSelectDate = useCallback(
    (newDate: Date) => {
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
    >
      <Button
        type="button"
        variant="text"
        size="s"
        className="border-gray-20 hover:bg-gray-5 w-full cursor-pointer justify-start gap-2 border bg-transparent px-2 py-2 text-left font-normal normal-case"
      >
        {getShortDateString(date)}
        <Calendar className="fill-brand-80 ml-auto h-4 w-4 shrink-0" />
      </Button>
    </DatePicker>
  );
});
