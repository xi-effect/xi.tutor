import { useState } from 'react';

import { useMaskInput } from '@xipkg/inputmask';
import { Calendar } from '@xipkg/icons';
import { Input } from '@xipkg/input';

import type { FC } from 'react';

interface InputDateProps {
  value: string;
  onChange: (val: string) => void;
  name?: string;
}

export const InputDate: FC<InputDateProps> = ({ value, onChange, name }) => {
  const [isActive, setIsActive] = useState(false);
  const inputRef = useMaskInput(isActive ? 'date' : undefined);

  // Получить день недели и месяц прописью
  const getWeekDay = (date: Date) => date.toLocaleDateString('ru-RU', { weekday: 'short' });
  const getMonthName = (date: Date) => date.toLocaleDateString('ru-RU', { month: 'long' });

  // Форматировать отображение
  const getDisplayValue = () => {
    if (!value) return '';
    const [d, m, y] = value.split('.');
    const dateObj = new Date(+y, +m - 1, +d);
    if (isActive) {
      return value;
    }
    return `${getWeekDay(dateObj)} ${d} ${getMonthName(dateObj)}`;
  };

  return (
    <Input
      ref={inputRef}
      name={name}
      value={getDisplayValue()}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Введите дату"
      variant="s"
      className="border-none outline-none"
      autoComplete="off"
      before={<Calendar className="h-4 w-4" />}
    />
  );
};
