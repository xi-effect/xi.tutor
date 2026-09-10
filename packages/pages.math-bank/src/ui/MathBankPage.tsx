import { useRef, useState } from 'react';
import { cn, useMediaQuery } from '@xipkg/utils';
import { NotFoundPage } from 'common.ui';
import { useCurrentUser } from 'common.services';
import { DEFAULT_MATH_BANK_FILTERS, type MathBankFiltersT } from '../types';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useMathBankIndex } from '../hooks/useMathBankIndex';
import { useMathBankSurfaceAnalytics } from '../hooks/useMathBankSurfaceAnalytics';
import { Header } from './Header';
import { MathBankErrorState } from './MathBankEmpty';
import { MathBankTasks } from './MathBankTasks';

export const MathBankPage = () => {
  const [filters, setFilters] = useState<MathBankFiltersT>(DEFAULT_MATH_BANK_FILTERS);
  const parentRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 960px)');
  const debouncedSearch = useDebouncedValue(filters.search);
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { search, catalog, examIndex, isLoading, isError } = useMathBankIndex(Boolean(isTutor));
  const appliedFilters = { ...filters, search: debouncedSearch };

  useMathBankSurfaceAnalytics(Boolean(isTutor), 'page', appliedFilters);

  if (!isTutor) {
    return <NotFoundPage withLogo={false} />;
  }

  return (
    <div
      className={cn(
        'bg-background-page flex flex-col gap-4',
        isMobile ? 'h-full min-h-0 overflow-hidden' : 'h-screen',
      )}
    >
      <div className="flex w-full shrink-0 items-start justify-between px-5 pt-4 sm:flex-row sm:px-8 sm:pt-8 md:px-10 md:pt-10">
        <Header
          filters={filters}
          catalog={catalog}
          examIndex={examIndex}
          isCatalogLoading={isLoading}
          onFiltersChange={setFilters}
          onResetFilters={() => setFilters(DEFAULT_MATH_BANK_FILTERS)}
        />
      </div>

      <div
        ref={parentRef}
        className={cn(
          'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:mt-4 sm:pr-5 sm:pl-8 md:pr-8 md:pl-10',
          isMobile && 'pb-20',
        )}
      >
        {isError ? (
          <MathBankErrorState />
        ) : (
          <MathBankTasks
            parentRef={parentRef}
            filters={appliedFilters}
            search={search}
            isLoading={isLoading}
            onResetFilters={() => setFilters(DEFAULT_MATH_BANK_FILTERS)}
          />
        )}
      </div>
    </div>
  );
};
