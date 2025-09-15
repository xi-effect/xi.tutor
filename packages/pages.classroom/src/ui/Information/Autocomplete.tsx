import * as React from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { ControllerRenderProps } from 'react-hook-form';

import { cn } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@xipkg/command';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';

const frameworks = [
  {
    value: 'next.js',
    label: 'Next.js',
  },
  {
    value: 'sveltekit',
    label: 'SvelteKit',
  },
  {
    value: 'nuxt.js',
    label: 'Nuxt.js',
  },
  {
    value: 'remix',
    label: 'Remix',
  },
  {
    value: 'astro',
    label: 'Astro',
  },
];

type AutocompleteProps = {
  field: ControllerRenderProps<{ subject: string }, 'subject'>;
};

export const Autocomplete = ({ field }: AutocompleteProps) => {
  const [open, setOpen] = React.useState(false);

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
            ? frameworks.find((framework) => framework.value === field.value)?.label
            : 'Select framework...'}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full border-none bg-transparent p-0">
        <Command className="w-[300px]">
          <CommandInput placeholder="Поиск предмета..." />
          <CommandList className="w-full">
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue: string) => {
                    field.onChange(currentValue === field.value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      field.value === framework.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
