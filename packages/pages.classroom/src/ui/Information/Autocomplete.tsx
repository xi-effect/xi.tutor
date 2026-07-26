import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import * as React from 'react';
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
import { cn } from '@xipkg/utils';
import { SubjectSchema } from 'common.api';
import { useAutocompleteSubjects, useSubjectsById } from 'common.services';
import { useTranslation } from 'react-i18next';

type SubjectField = { value: number | null; onChange: (value: number | null) => void };

type AutocompleteProps = {
  field: SubjectField;
  disabled?: boolean;
};

export const Autocomplete = ({ field, disabled }: AutocompleteProps) => {
  const { t } = useTranslation('classroom');
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Получаем данные предметов через API для автокомплита
  const {
    data: subjects,
    isLoading,
    isError,
  } = useAutocompleteSubjects(
    search,
    10,
    !open || search.length < 1, // Отключаем запрос когда попап закрыт
  );

  // Получаем данные конкретного предмета по ID для отображения в кнопке
  const { data: selectedSubject, isLoading: isLoadingSelected } = useSubjectsById(
    field.value || 0,
    !field.value, // Отключаем запрос если нет выбранного предмета
  );

  const hasSelection = Boolean(field.value);
  const triggerLabel = hasSelection
    ? isLoadingSelected
      ? t('autocomplete.loading')
      : selectedSubject?.name || t('autocomplete.notFound')
    : t('autocomplete.select');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="text"
          role="combobox"
          aria-expanded={open}
          title={field.value && !isLoadingSelected ? selectedSubject?.name : undefined}
          className="border-border-control bg-background-surface dark:text-text-primary hover:border-border-control h-[32px] w-full justify-between rounded-lg border-2 pr-4 pl-3 hover:bg-transparent"
        >
          <span
            className={cn(
              'truncate',
              hasSelection
                ? 'dark:text-text-primary text-text-primary'
                : 'text-text-disabled dark:text-text-secondary',
            )}
          >
            {triggerLabel}
          </span>
          <ChevronsUpDownIcon className="text-text-primary dark:text-text-secondary ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full border-none bg-transparent p-0">
        <Command
          className="[&_[data-slot=command-input-wrapper]_svg]:fill-icon-secondary w-[300px]"
          shouldFilter={false}
        >
          <CommandInput
            placeholder={t('autocomplete.search')}
            value={search}
            onValueChange={setSearch}
            className="dark:text-text-primary text-text-primary"
          />
          <CommandList className="w-full">
            {isLoading ? (
              <div className="text-text-secondary dark:text-text-secondary py-6 text-center text-sm">
                {t('autocomplete.loading')}
              </div>
            ) : isError ? (
              <div className="text-text-danger py-6 text-center text-sm">
                {t('errors.loadFailed')}
              </div>
            ) : !subjects || subjects.length === 0 ? (
              <div className="text-text-secondary dark:text-text-primary py-6 text-center text-sm">
                {t('autocomplete.empty')}
              </div>
            ) : (
              <CommandGroup>
                {subjects.map((subject: SubjectSchema) => (
                  <CommandItem
                    key={subject.id}
                    value={subject.name}
                    className="dark:text-text-primary text-text-primary"
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
    </Popover>
  );
};
