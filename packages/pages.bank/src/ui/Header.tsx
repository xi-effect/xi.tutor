import { useTranslation } from 'react-i18next';
import type { BankSubject, MathBankCatalogItem, MathBankExamIndexItem } from 'features.math.bank';
import type { MathBankFiltersT } from '../types';
import { MathBankSearchField } from './MathBankSearchField';
import { MathBankToolbar } from './MathBankToolbar';
import { MathBankDisclaimer } from './MathBankDisclaimer';

type HeaderProps = {
  subject: BankSubject;
  filters: MathBankFiltersT;
  catalog: MathBankCatalogItem[];
  examIndex: MathBankExamIndexItem[];
  isCatalogLoading?: boolean;
  onSubjectChange: (subject: BankSubject) => void;
  onFiltersChange: (filters: MathBankFiltersT) => void;
  onResetFilters: () => void;
};

export const Header = ({
  subject,
  filters,
  catalog,
  examIndex,
  isCatalogLoading,
  onSubjectChange,
  onFiltersChange,
  onResetFilters,
}: HeaderProps) => {
  const { t } = useTranslation('mathBank');

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="inline-flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-baseline gap-1.5 pb-2">
          <h1 className="font-playfair text-text-primary text-2xl leading-none font-medium sm:text-4xl">
            {t('title')}
          </h1>
          <MathBankDisclaimer className="translate-y-[-0.12em]" />
        </div>
        <MathBankSearchField
          value={filters.search}
          onChange={(search) => onFiltersChange({ ...filters, search })}
          placeholder={t('search.placeholder')}
        />
      </div>
      <MathBankToolbar
        subject={subject}
        filters={filters}
        catalog={catalog}
        examIndex={examIndex}
        isCatalogLoading={isCatalogLoading}
        onSubjectChange={onSubjectChange}
        onChange={onFiltersChange}
        onReset={onResetFilters}
      />
    </div>
  );
};
