import { memo, useCallback, useEffect, useState } from 'react';

import { DatePicker } from '@xipkg/datepicker';
import { Calendar } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { getFullDateString } from '../../utils/utils';

interface InputDateProps {
  value?: Date;
  onChange: (val: Date) => void;
}

export const InputDate = memo<InputDateProps>(({ value, onChange }) => {
  const [date, setDate] = useState<Date>(value || new Date());

  const handleSelectDate = useCallback(
    (newDate: Date) => {
      console.log('newDate', newDate);
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
      <Input
        name="startDate"
        value={getFullDateString(date)}
        variant="s"
        className="cursor-pointer border-1 text-left"
        before={<Calendar className="fill-gray-80 h-4 w-4" />}
      />
    </DatePicker>
  );
});
