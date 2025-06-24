import { useMemo, useState } from 'react';

import { Input } from '@xipkg/input';
import { Button } from '@xipkg/button';
import { CrossCircle } from '@xipkg/icons';

import type { FC } from 'react';
import type { SubjectT } from '../../types/InvoiceTypes';

interface InputWithHelperProps {
  activeSubjects: string[];
  suggestions: SubjectT[];
  onRemoveItem: (id: string) => void;
  onSelectItem: (id: string) => void;
}

export const InputWithHelper: FC<InputWithHelperProps> = ({
  activeSubjects,
  suggestions,
  onRemoveItem,
  onSelectItem,
}) => {
  const [inputValue, setInputValue] = useState('');

  const filteredSuggestions = useMemo(() => {
    if (!inputValue) return [];
    return suggestions.filter((suggestion) => {
      const suggestionName = suggestion.name.toLowerCase();
      return (
        suggestionName.includes(inputValue.toLowerCase()) &&
        !activeSubjects.some((subj) => subj === suggestion.name)
      );
    });
  }, [inputValue, activeSubjects, suggestions]);

  return (
    <>
      <div className="w-full rounded-lg border border-gray-300 bg-white px-3">
        <div className="flex w-full flex-wrap items-center gap-2">
          {activeSubjects.map((subject) => (
            <div
              key={subject}
              className="bg-gray-5 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-gray-100"
            >
              <span>{subject}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(subject)}
                className="p-0 hover:bg-transparent"
              >
                <CrossCircle className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Input
            value={inputValue}
            placeholder={activeSubjects.length > 0 ? '' : 'Введите предметы через запятую'}
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
                key={suggestion.id}
                onClick={() => onSelectItem(suggestion.id)}
                className={`cursor-pointer px-4 py-2 text-gray-900 hover:bg-gray-50`}
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
