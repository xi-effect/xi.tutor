import { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverTrigger } from '@xipkg/popover';
import type { ExamKind, MathBankExamIndexItem } from 'features.math.bank';
import { useTranslation } from 'react-i18next';
import { EXAM_KINDS } from '../utils/exam';
import { FilterChip } from './FilterChip';
import { FilterOption } from './FilterOption';
import { FilterActions, FilterPopoverContent, filterScrollAreaClass } from './FilterActions';

type ExamFilterProps = {
  exam: ExamKind | null;
  taskNumbers: number[];
  examIndex: MathBankExamIndexItem[];
  onChange: (exam: ExamKind | null, taskNumbers: number[]) => void;
};

export const ExamFilter = ({ exam, taskNumbers, examIndex, onChange }: ExamFilterProps) => {
  const { t } = useTranslation('mathBank');
  const [open, setOpen] = useState(false);
  const [draftExam, setDraftExam] = useState<ExamKind | null>(exam);
  const [draftNumbers, setDraftNumbers] = useState<number[]>(taskNumbers);

  useEffect(() => {
    if (open) {
      setDraftExam(exam);
      setDraftNumbers(taskNumbers);
    }
  }, [exam, open, taskNumbers]);

  const numbers = useMemo(
    () =>
      examIndex
        .filter((item) => item.exam === draftExam)
        .map((item) => item.taskNumber)
        .sort((a, b) => a - b),
    [draftExam, examIndex],
  );

  const chipLabel = exam
    ? taskNumbers.length > 0
      ? `${t(`filters.exam.${exam}`)} · ${t('filters.exam.taskNumberChip', { numbers: taskNumbers.join(', ') })}`
      : t('filters.exam.chipValue', { exam: t(`filters.exam.${exam}`) })
    : t('filters.exam.chip');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilterChip open={open} selected={Boolean(exam)} umamiEvent="math-bank-exam-filter">
          {chipLabel}
        </FilterChip>
      </PopoverTrigger>
      <FilterPopoverContent>
        <div className="flex w-full flex-col items-stretch gap-3 bg-transparent">
          <FilterOption
            selected={draftExam === null}
            onSelect={() => {
              setDraftExam(null);
              setDraftNumbers([]);
            }}
            umamiEvent="math-bank-exam-option"
            umamiScope="all"
          >
            {t('filters.exam.all')}
          </FilterOption>
          {EXAM_KINDS.map((kind) => (
            <FilterOption
              key={kind}
              selected={draftExam === kind}
              onSelect={() => {
                setDraftExam(kind);
                setDraftNumbers([]);
              }}
              umamiEvent="math-bank-exam-option"
              umamiScope={kind}
            >
              {t(`filters.exam.${kind}`)}
            </FilterOption>
          ))}
        </div>
        {draftExam && numbers.length > 0 ? (
          <div className={filterScrollAreaClass}>
            <p className="text-s-base text-text-secondary">{t('filters.exam.taskNumber')}</p>
            {numbers.map((number) => (
              <FilterOption
                key={number}
                variant="checkbox"
                selected={draftNumbers.includes(number)}
                onSelect={() =>
                  setDraftNumbers((current) =>
                    current.includes(number)
                      ? current.filter((item) => item !== number)
                      : [...current, number],
                  )
                }
                umamiEvent="math-bank-exam-number-option"
                umamiScope={String(number)}
              >
                №{number}
              </FilterOption>
            ))}
          </div>
        ) : null}
        <FilterActions
          canReset={draftExam !== null || draftNumbers.length > 0}
          onReset={() => {
            setDraftExam(null);
            setDraftNumbers([]);
          }}
          onApply={() => {
            onChange(draftExam, draftNumbers);
            setOpen(false);
          }}
          resetUmami="math-bank-exam-reset"
          applyUmami="math-bank-exam-apply"
        />
      </FilterPopoverContent>
    </Popover>
  );
};
