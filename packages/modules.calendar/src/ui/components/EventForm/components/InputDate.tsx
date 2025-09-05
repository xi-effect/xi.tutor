import { memo } from 'react';

import { DatePicker } from '@xipkg/datepicker';
import { Calendar } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { dateToString } from '../../../../utils/calendarUtils';

interface InputDateProps {
  value: string;
  onChange: (val: string) => void;
  name?: string;
}

export const InputDate = memo<InputDateProps>(({ value, name }) => {
  return (
    <DatePicker>
      <Input
        name={name}
        value={dateToString(value)}
        placeholder="Введите дату"
        variant="s"
        className="cursor-pointer border border-transparent outline-none hover:border-gray-100 focus:border-gray-100"
        before={<Calendar className="fill-gray-80 h-4 w-4" />}
      />
    </DatePicker>
  );
});
