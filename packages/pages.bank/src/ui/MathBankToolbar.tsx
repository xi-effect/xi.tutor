import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import type { BankSubject, MathBankCatalogItem, MathBankExamIndexItem } from 'features.math.bank';
import { hasActiveMathBankFilters } from '../utils/filters';
import { EXAM_KINDS_BY_SUBJECT, TASK_TYPES_BY_SUBJECT, type MathBankFiltersT } from '../types';
import { GradeFilter } from './GradeFilter';
import { TopicFilter } from './TopicFilter';
import { DifficultyFilter } from './DifficultyFilter';
import { ExamFilter } from './ExamFilter';
import { TypeFilter } from './TypeFilter';
import { FavoritesFilter } from './FavoritesFilter';
import { SubjectFilter } from './SubjectFilter';

type MathBankToolbarProps = {
  subject: BankSubject;
  filters: MathBankFiltersT;
  catalog: MathBankCatalogItem[];
  examIndex: MathBankExamIndexItem[];
  isCatalogLoading?: boolean;
  onSubjectChange: (subject: BankSubject) => void;
  onChange: (filters: MathBankFiltersT) => void;
  onReset: () => void;
};

export const MathBankToolbar = ({
  subject,
  filters,
  catalog,
  examIndex,
  isCatalogLoading,
  onSubjectChange,
  onChange,
  onReset,
}: MathBankToolbarProps) => {
  const { t } = useTranslation('mathBank');
  const showReset = hasActiveMathBankFilters(filters);

  return (
    <div className="flex w-full flex-wrap items-center gap-3">
      <SubjectFilter value={subject} onChange={onSubjectChange} />
      <GradeFilter
        value={filters.grades}
        onChange={(grades) => onChange({ ...filters, grades, topics: [] })}
      />
      <TopicFilter
        value={filters.topics}
        grades={filters.grades}
        catalog={catalog}
        isLoading={isCatalogLoading}
        onChange={(topics) => onChange({ ...filters, topics })}
      />
      <DifficultyFilter
        value={filters.difficultyGroups}
        onChange={(difficultyGroups) => onChange({ ...filters, difficultyGroups })}
      />
      <ExamFilter
        exam={filters.exam}
        taskNumbers={filters.examTaskNumbers}
        examKinds={EXAM_KINDS_BY_SUBJECT[subject]}
        examIndex={examIndex}
        onChange={(nextExam, examTaskNumbers) =>
          onChange({ ...filters, exam: nextExam, examTaskNumbers })
        }
      />
      <TypeFilter
        value={filters.taskTypes}
        types={TASK_TYPES_BY_SUBJECT[subject]}
        onChange={(taskTypes) => onChange({ ...filters, taskTypes })}
      />
      <FavoritesFilter
        selected={filters.favoritesOnly}
        onChange={(favoritesOnly) => onChange({ ...filters, favoritesOnly })}
      />
      {showReset ? (
        <Button
          type="button"
          variant="none"
          className="text-s-base text-text-link hover:bg-status-info-background hover:text-text-link h-auto rounded-lg px-2 py-1 font-medium"
          onClick={onReset}
          data-umami-event="math-bank-reset-all"
        >
          {t('filters.resetAll')}
        </Button>
      ) : null}
    </div>
  );
};
