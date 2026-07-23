import * as React from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { ControllerRenderProps } from 'react-hook-form';

import { cn } from '@xipkg/utils';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@xipkg/command';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { useAutocompleteSubjects, useSubjectsById } from 'common.services';
import { SubjectSchema } from 'common.api';
import type { FormData } from '../model';

type AutocompleteProps = {
  field: ControllerRenderProps<FormData, 'subject'>;
  disabled?: boolean;
  containerRef?: React.RefObject<HTMLElement | null>;
};

export const Autocomplete = ({ field, disabled, containerRef }: AutocompleteProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Закрываем Popover при изменении значения
  React.useEffect(() => {
    if (field.value && field.value !== 0) {
      setOpen(false);
    }
  }, [field.value]);

  // Получаем данные предметов через API для автокомплита
  const {
    data: subjects,
    isLoading,
    isError,
  } = useAutocompleteSubjects(
    search,
    10,
    !open || search.length < 1, // Запрос только при открытом попапе и search >= 1 символа
  );

  // Получаем данные конкретного предмета по ID для отображения в кнопке
  const { data: selectedSubject, isLoading: isLoadingSelected } = useSubjectsById(
    field.value || 0,
    !field.value, // Отключаем запрос если нет выбранного предмета
  );

  const hasSelection = Boolean(field.value && field.value !== 0);
  const triggerLabel = hasSelection
    ? isLoadingSelected
      ? 'Загрузка...'
      : selectedSubject?.name || 'Предмет не найден'
    : 'Выберите предмет...';

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'border-border-control bg-background-surface flex h-12 w-full items-center justify-between rounded-lg border-2 px-3 text-left text-sm font-normal',
            'focus-visible:border-border-strong hover:border-border-control focus-visible:outline-none',
            'disabled:bg-background-subtle disabled:text-text-disabled disabled:cursor-not-allowed',
          )}
        >
          <span
            className={cn('truncate', hasSelection ? 'text-text-primary' : 'text-text-disabled')}
          >
            {triggerLabel}
          </span>
          <ChevronsUpDownIcon className="text-text-primary ml-2 h-4 w-4 shrink-0" />
        </button>
      </PopoverTrigger>
      {containerRef?.current && (
        <PopoverContent
          container={containerRef.current}
          className="z-[9999] w-full border-none bg-transparent p-0"
          side="bottom"
          align="start"
          sideOffset={4}
          avoidCollisions={false}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command
            className="[&_[data-slot=command-input-wrapper]_svg]:fill-icon-secondary w-[300px]"
            shouldFilter={false}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <CommandInput
              placeholder="Поиск предмета..."
              value={search}
              onValueChange={setSearch}
              className="text-text-primary"
            />
            <CommandList className="max-h-[200px] w-full overflow-y-auto">
              {isLoading ? (
                <div className="text-text-secondary py-6 text-center text-sm">Загрузка...</div>
              ) : isError ? (
                <div className="text-text-danger py-6 text-center text-sm">Ошибка загрузки</div>
              ) : !subjects || subjects.length === 0 ? (
                <div className="text-text-secondary py-6 text-center text-sm">
                  Предметы не найдены
                </div>
              ) : (
                <CommandGroup>
                  {subjects.map((subject: SubjectSchema) => (
                    <CommandItem
                      key={subject.id}
                      value={subject.name}
                      className="text-text-primary"
                      onSelect={() => {
                        if (disabled) return;
                        field.onChange(subject.id);
                        setOpen(false);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          'text-text-primary mr-2 h-4 w-4',
                          field.value === subject.id ? 'opacity-100' : 'opacity-0',
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
      )}
    </Popover>
  );
};
