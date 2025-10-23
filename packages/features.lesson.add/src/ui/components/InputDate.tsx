import { memo, useCallback, useEffect, useState } from 'react';

import { DatePicker } from '@xipkg/datepicker';
import { Calendar } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { convertStringToDate, getFullDateString } from '../../utils/utils';

interface InputDateProps {
  value?: string;
}

export const InputDate = memo<InputDateProps>(({ value }) => {
  const [date, setDate] = useState<Date>(convertStringToDate(value || ''));

  const handleSelectDate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  useEffect(() => {
    setDate(convertStringToDate(value || ''));
  }, [value]);

  return (
    <DatePicker
      calendarProps={{ mode: 'single', selected: date, onSelect: handleSelectDate, required: true }}
    >
      <Input
        value={getFullDateString(date)}
        variant="s"
        className="cursor-pointer border-1 text-left"
        before={<Calendar className="fill-gray-80 h-4 w-4" />}
      />
    </DatePicker>
  );
});
