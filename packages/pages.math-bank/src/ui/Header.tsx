import { useTranslation } from 'react-i18next';
import type { MathBankCatalogItem, MathBankExamIndexItem } from 'features.math.bank';
import type { MathBankFiltersT } from '../types';
import { MathBankSearchField } from './MathBankSearchField';
import { MathBankToolbar } from './MathBankToolbar';

type HeaderProps = {
  filters: MathBankFiltersT;
  catalog: MathBankCatalogItem[];
  examIndex: MathBankExamIndexItem[];
  isCatalogLoading?: boolean;
  onFiltersChange: (filters: MathBankFiltersT) => void;
  onResetFilters: () => void;
};

export const Header = ({
  filters,
  catalog,
  examIndex,
  isCatalogLoading,
  onFiltersChange,
  onResetFilters,
}: HeaderProps) => {
  const { t } = useTranslation('mathBank');

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="inline-flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-playfair text-text-primary pb-2 text-2xl font-medium sm:text-4xl">
          {t('title')}
        </h1>
        <MathBankSearchField
          value={filters.search}
          onChange={(search) => onFiltersChange({ ...filters, search })}
          placeholder={t('search.placeholder')}
        />
      </div>
      <MathBankToolbar
        filters={filters}
        catalog={catalog}
        examIndex={examIndex}
        isCatalogLoading={isCatalogLoading}
        onChange={onFiltersChange}
        onReset={onResetFilters}
      />
    </div>
  );
};
