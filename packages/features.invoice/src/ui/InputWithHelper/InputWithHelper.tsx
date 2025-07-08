import { useMemo, useState } from 'react';

import { Input } from '@xipkg/input';
import { Button } from '@xipkg/button';
import { CrossCircle } from '@xipkg/icons';

import type { FC } from 'react';

interface InputWithHelperProps {
  className?: string;
  values: string[];
  suggestions: string[];
  onRemoveItem: (item: string) => void;
  onSelectItem: (item: string) => void;
}

export const InputWithHelper: FC<InputWithHelperProps> = ({
  values,
  suggestions,
  onRemoveItem,
  onSelectItem,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');

  const filteredSuggestions = useMemo(() => {
    if (!inputValue) return [];
    return suggestions.filter((suggestion) => {
      return (
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !values.some((val) => val === suggestion)
      );
    });
  }, [inputValue, values, suggestions]);

  const handleSelectItem = (item: string) => {
    onSelectItem(item);
    setInputValue('');
  };

  return (
    <>
      <div className={`w-full rounded-lg border border-gray-300 bg-white px-3 ${className}`}>
        <div className="flex w-full flex-wrap items-center gap-2">
          {values.map((value) => (
            <div
              key={value}
              className="bg-gray-5 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-gray-100"
            >
              <span>{value}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(value)}
                className="p-0 hover:bg-transparent"
              >
                <CrossCircle className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Input
            value={inputValue}
            placeholder={values.length > 0 ? '' : 'Введите предметы через запятую'}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full border-none p-0 outline-none"
          />
        </div>
      </div>
      {filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
          <ul className="py-1">
            {filteredSuggestions.map((suggestion) => (
              <li
                key={suggestion}
                onClick={() => handleSelectItem(suggestion)}
                className={`cursor-pointer px-4 py-2 text-gray-900 hover:bg-gray-50`}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
