import { type RefObject, useMemo, useState } from 'react';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { useMediaQuery } from '@xipkg/utils';
import type { MathTaskSearch, MathTaskSearchDocument } from 'features.math.bank';
import { hasActiveMathBankFilters, searchMathBank } from '../utils/filters';
import { useMathBankUserStore } from '../store/useMathBankUserStore';
import { useToggleMathBankFavorite } from '../hooks/useToggleMathBankFavorite';
import type { MathBankFiltersT } from '../types';
import { MathBankEmpty } from './MathBankEmpty';
import { MathBankSkeleton } from './MathBankSkeleton';
import { MathBankTaskCard } from './MathBankTaskCard';
import { MathBankTaskModal } from './MathBankTaskModal';

type MathBankTasksProps = {
  parentRef: RefObject<HTMLDivElement | null>;
  filters: MathBankFiltersT;
  search: MathTaskSearch | null;
  isLoading: boolean;
  onResetFilters: () => void;
};

export const MathBankTasks = ({
  parentRef,
  filters,
  search,
  isLoading,
  onResetFilters,
}: MathBankTasksProps) => {
  const isMobile = useMediaQuery('(max-width: 960px)');
  const favoriteTaskIds = useMathBankUserStore((state) => state.favoriteTaskIds);
  const toggleFavorite = useToggleMathBankFavorite();
  const [preview, setPreview] = useState<MathTaskSearchDocument | null>(null);

  const items = useMemo(
    () => searchMathBank(search, filters, favoriteTaskIds),
    [favoriteTaskIds, filters, search],
  );

  if (isLoading) {
    return <MathBankSkeleton />;
  }

  if (!items.length) {
    return hasActiveMathBankFilters(filters) ? (
      <MathBankEmpty onReset={onResetFilters} />
    ) : (
      <MathBankSkeleton />
    );
  }

  return (
    <>
      <GridVirtualizer
        parentRef={parentRef}
        items={items}
        defaultRowHeight={208}
        minItemWidth={300}
        gap={20}
        maxColumns={4}
        isSingleColumn={isMobile}
        renderItem={(task) => (
          <MathBankTaskCard
            task={task}
            isFavorite={favoriteTaskIds.includes(task.id)}
            onOpen={setPreview}
            onToggleFavorite={toggleFavorite}
          />
        )}
      />
      <MathBankTaskModal
        task={preview}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setPreview(null);
          }
        }}
        onTaskChange={setPreview}
      />
    </>
  );
};
