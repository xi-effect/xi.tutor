import { useState } from 'react';
import { Popover, PopoverTrigger } from '@xipkg/popover';
import { BANK_SUBJECTS, type BankSubject } from 'features.math.bank';
import { useTranslation } from 'react-i18next';
import { FilterChip } from './FilterChip';
import { FilterOption } from './FilterOption';
import { FilterPopoverContent } from './FilterActions';

type SubjectFilterProps = {
  value: BankSubject;
  onChange: (subject: BankSubject) => void;
};

export const SubjectFilter = ({ value, onChange }: SubjectFilterProps) => {
  const { t } = useTranslation('mathBank');
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilterChip open={open} umamiEvent="math-bank-subject-filter">
          {t(`subjects.${value}`)}
        </FilterChip>
      </PopoverTrigger>
      <FilterPopoverContent>
        <div className="flex w-full flex-col items-stretch gap-3 bg-transparent">
          {BANK_SUBJECTS.map((subject) => (
            <FilterOption
              key={subject}
              selected={value === subject}
              onSelect={() => {
                onChange(subject);
                setOpen(false);
              }}
              umamiEvent="math-bank-subject-option"
              umamiScope={subject}
            >
              {t(`subjects.${subject}`)}
            </FilterOption>
          ))}
        </div>
      </FilterPopoverContent>
    </Popover>
  );
};
