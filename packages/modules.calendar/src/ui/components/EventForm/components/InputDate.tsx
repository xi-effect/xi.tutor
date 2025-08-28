import { memo, useCallback, useMemo, useState } from 'react';

import { useMaskInput } from '@xipkg/inputmask';
import { Calendar } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { dateToString } from '../../../../utils/calendarUtils';

interface InputDateProps {
  value: string;
  onChange: (val: string) => void;
  name?: string;
}

export const InputDate = memo<InputDateProps>(({ value, onChange, name }) => {
  const [isActive, setIsActive] = useState(false);
  const inputRef = useMaskInput(isActive ? 'date' : undefined);

  const displayValue = useMemo(() => {
    if (!value) return '';
    if (isActive) return value;

    return dateToString(value);
  }, [value, isActive]);

  const handleBlur = useCallback(() => {
    setIsActive(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsActive(true);
  }, []);

  return (
    <Input
      ref={inputRef}
      name={name}
      value={displayValue}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Введите дату"
      variant="s"
      className="border border-transparent outline-none hover:border-gray-100 focus:border-gray-100"
      autoComplete="off"
      before={<Calendar className="fill-gray-80 h-4 w-4" />}
    />
  );
});
