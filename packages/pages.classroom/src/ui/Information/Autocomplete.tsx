import * as React from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { ControllerRenderProps } from 'react-hook-form';

import { cn } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import {
  Command,
  // CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@xipkg/command';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { useAutocompleteSubjects } from 'common.services';
import { SubjectSchema } from 'common.api';

type AutocompleteProps = {
  field: ControllerRenderProps<{ subject: string }, 'subject'>;
};

export const Autocomplete = ({ field }: AutocompleteProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Получаем данные предметов через API
  const {
    data: subjects,
    isLoading,
    isError,
  } = useAutocompleteSubjects(
    search,
    10,
    !open, // Отключаем запрос когда попап закрыт
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="border-gray-30 h-[32px] w-full justify-between border-2 pl-3 hover:border-gray-50 hover:bg-transparent"
        >
          {field.value
            ? subjects?.find((subject: SubjectSchema) => subject.id.toString() === field.value)
                ?.name
            : 'Выберите предмет...'}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full border-none bg-transparent p-0">
        <Command className="w-[300px]" shouldFilter={false}>
          <CommandInput placeholder="Поиск предмета..." value={search} onValueChange={setSearch} />
          <CommandList className="w-full">
            {isLoading ? (
              <div className="py-6 text-center text-sm">Загрузка...</div>
            ) : isError ? (
              <div className="py-6 text-center text-sm text-red-500">Ошибка загрузки</div>
            ) : !subjects || subjects.length === 0 ? (
              <div className="py-6 text-center text-sm">Предметы не найдены</div>
            ) : (
              <CommandGroup>
                {subjects.map((subject: SubjectSchema) => (
                  <CommandItem
                    key={subject.id}
                    value={subject.name}
                    onSelect={() => {
                      field.onChange(subject.id.toString());
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        'mr-2 h-4 w-4',
                        field.value === subject.id.toString() ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {subject.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
