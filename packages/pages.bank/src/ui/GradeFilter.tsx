import { useEffect, useState } from 'react';
import { Popover, PopoverTrigger } from '@xipkg/popover';
import { MATH_GRADES } from 'features.math.bank';
import { useTranslation } from 'react-i18next';
import { FilterChip } from './FilterChip';
import { FilterOption } from './FilterOption';
import { FilterActions, FilterPopoverContent } from './FilterActions';

type GradeFilterProps = {
  value: number[];
  onChange: (grades: number[]) => void;
};

export const GradeFilter = ({ value, onChange }: GradeFilterProps) => {
  const { t } = useTranslation('mathBank');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<number[]>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const toggleGrade = (grade: number) => {
    setDraft((current) =>
      current.includes(grade) ? current.filter((item) => item !== grade) : [...current, grade],
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilterChip open={open} selected={value.length > 0} umamiEvent="math-bank-grade-filter">
          {value.length > 0
            ? t('filters.grade.chipCount', { count: value.length })
            : t('filters.grade.chip')}
        </FilterChip>
      </PopoverTrigger>
      <FilterPopoverContent>
        <div className="flex w-full flex-col items-stretch gap-3 bg-transparent">
          {MATH_GRADES.map((grade) => (
            <FilterOption
              key={grade}
              variant="checkbox"
              selected={draft.includes(grade)}
              onSelect={() => toggleGrade(grade)}
              umamiEvent="math-bank-grade-option"
              umamiScope={String(grade)}
            >
              {t('filters.grade.option', { grade })}
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
          resetUmami="math-bank-grade-reset"
          applyUmami="math-bank-grade-apply"
        />
      </FilterPopoverContent>
    </Popover>
  );
};
