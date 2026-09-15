import { useEffect, useState } from 'react';
import { Popover, PopoverTrigger } from '@xipkg/popover';
import { useTranslation } from 'react-i18next';
import type { MathDifficultyGroup } from '../types';
import { FilterChip } from './FilterChip';
import { FilterOption } from './FilterOption';
import { FilterActions, FilterPopoverContent } from './FilterActions';

const GROUPS: MathDifficultyGroup[] = ['basic', 'medium', 'advanced'];

type DifficultyFilterProps = {
  value: MathDifficultyGroup[];
  onChange: (groups: MathDifficultyGroup[]) => void;
};

export const DifficultyFilter = ({ value, onChange }: DifficultyFilterProps) => {
  const { t } = useTranslation('mathBank');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MathDifficultyGroup[]>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const toggleGroup = (group: MathDifficultyGroup) => {
    setDraft((current) =>
      current.includes(group) ? current.filter((item) => item !== group) : [...current, group],
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilterChip
          open={open}
          selected={value.length > 0}
          umamiEvent="math-bank-difficulty-filter"
        >
          {value.length > 0
            ? t('filters.difficulty.chipCount', { count: value.length })
            : t('filters.difficulty.chip')}
        </FilterChip>
      </PopoverTrigger>
      <FilterPopoverContent>
        <div className="flex w-full flex-col items-stretch gap-3 bg-transparent">
          {GROUPS.map((group) => (
            <FilterOption
              key={group}
              variant="checkbox"
              selected={draft.includes(group)}
              onSelect={() => toggleGroup(group)}
              umamiEvent="math-bank-difficulty-option"
              umamiScope={group}
            >
              {t(`filters.difficulty.${group}`)}
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
          resetUmami="math-bank-difficulty-reset"
          applyUmami="math-bank-difficulty-apply"
        />
      </FilterPopoverContent>
    </Popover>
  );
};
