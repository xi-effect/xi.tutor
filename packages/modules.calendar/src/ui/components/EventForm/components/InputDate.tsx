import { memo, useCallback, useEffect, useState } from 'react';

import { DatePicker } from '@xipkg/datepicker';
import { Calendar } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { convertStringToDate, getFullDateString } from '../../../../utils/calendarUtils';

interface InputDateProps {
  value?: string;
  onChange: (val: Date, key: 'startDate' | 'endDate') => void;
  name: 'startDate' | 'endDate';
}

export const InputDate = memo<InputDateProps>(({ value, name, onChange }) => {
  const [date, setDate] = useState<Date>(convertStringToDate(value || ''));

  const handleSelectDate = useCallback(
    (newDate: Date) => {
      setDate(newDate);
      onChange(newDate, name);
    },
    [onChange, name],
  );

  useEffect(() => {
    setDate(convertStringToDate(value || ''));
  }, [value]);

  return (
    <DatePicker
      calendarProps={{ mode: 'single', selected: date, onSelect: handleSelectDate, required: true }}
    >
      <Input
        name={name}
        value={getFullDateString(date)}
        placeholder="Введите дату"
        variant="s"
        className="cursor-pointer border border-transparent outline-none hover:border-gray-100 focus:border-gray-100"
        before={<Calendar className="fill-gray-80 h-4 w-4" />}
      />
    </DatePicker>
  );
});
