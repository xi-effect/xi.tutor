import { useEffect, useState } from 'react';
import { Popover, PopoverTrigger } from '@xipkg/popover';
import type { MathTaskType } from 'features.math.bank';
import { useTranslation } from 'react-i18next';
import { MATH_TASK_TYPES } from '../types';
import { FilterChip } from './FilterChip';
import { FilterOption } from './FilterOption';
import { FilterActions, FilterPopoverContent, filterScrollAreaClass } from './FilterActions';

type TypeFilterProps = {
  value: MathTaskType[];
  onChange: (types: MathTaskType[]) => void;
};

export const TypeFilter = ({ value, onChange }: TypeFilterProps) => {
  const { t } = useTranslation('mathBank');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MathTaskType[]>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const toggleType = (type: MathTaskType) => {
    setDraft((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilterChip open={open} selected={value.length > 0} umamiEvent="math-bank-type-filter">
          {value.length > 0
            ? t('filters.type.chipCount', { count: value.length })
            : t('filters.type.chip')}
        </FilterChip>
      </PopoverTrigger>
      <FilterPopoverContent>
        <div className={filterScrollAreaClass}>
          {MATH_TASK_TYPES.map((type) => (
            <FilterOption
              key={type}
              variant="checkbox"
              selected={draft.includes(type)}
              onSelect={() => toggleType(type)}
              umamiEvent="math-bank-type-option"
              umamiScope={type}
            >
              {t(`filters.type.${type}`)}
            </FilterOption>
          ))}
        </div>
        <FilterActions
          canReset={draft.length > 0}
          onReset={() => setDraft([])}
          onApply={() => {
            onChange(draft);
            setOpen(false);
          }}
          resetUmami="math-bank-type-reset"
          applyUmami="math-bank-type-apply"
        />
      </FilterPopoverContent>
    </Popover>
  );
};
