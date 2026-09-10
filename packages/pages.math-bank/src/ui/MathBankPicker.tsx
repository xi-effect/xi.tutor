import { useMemo, useRef, useState } from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { Close } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  trackMathTaskInsertBoard,
  trackMathTaskInsertNote,
  type MathBankAnalyticsSource,
} from 'common.utils';
import { useTranslation } from 'react-i18next';
import type { MathTaskSearchDocument } from 'features.math.bank';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useMathBankIndex } from '../hooks/useMathBankIndex';
import { useMathBankSurfaceAnalytics } from '../hooks/useMathBankSurfaceAnalytics';
import { DEFAULT_MATH_BANK_FILTERS, type MathBankFiltersT } from '../types';
import { toMathBankTaskSnapshot } from '../utils/analytics';
import { hasActiveMathBankFilters, searchMathBank } from '../utils/filters';
import { useMathBankUserStore } from '../store/useMathBankUserStore';
import { MathBankEmpty } from './MathBankEmpty';
import { MathBankPickerRow } from './MathBankPickerRow';
import { MathBankSearchField } from './MathBankSearchField';
import { MathBankToolbar } from './MathBankToolbar';

export type MathBankPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (task: MathTaskSearchDocument) => void | Promise<void>;
  addLabel: string;
  description?: string;
  overlayClassName?: string;
  contentClassName?: string;
  chromeClassName?: string;
  umamiPrefix?: string;
  analyticsSource?: MathBankAnalyticsSource;
};

const MathBankPickerContent = ({
  open,
  onOpenChange,
  onSelect,
  addLabel,
  description,
  overlayClassName,
  contentClassName,
  umamiPrefix = 'math-bank',
  analyticsSource = 'board',
}: MathBankPickerProps) => {
  const { t } = useTranslation('mathBank');
  const parentRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<MathBankFiltersT>(DEFAULT_MATH_BANK_FILTERS);
  const [insertingId, setInsertingId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(filters.search);
  const favoriteTaskIds = useMathBankUserStore((state) => state.favoriteTaskIds);
  const { search, catalog, examIndex, isLoading, isError } = useMathBankIndex(open);
  const appliedFilters = { ...filters, search: debouncedSearch };

  useMathBankSurfaceAnalytics(open, analyticsSource, appliedFilters);

  const items = useMemo(
    () => searchMathBank(search, { ...filters, search: debouncedSearch }, favoriteTaskIds),
    [debouncedSearch, favoriteTaskIds, filters, search],
  );

  const filtersActive = hasActiveMathBankFilters({ ...filters, search: debouncedSearch });
  const title = t('picker.title');
  const descriptionText = description ?? t('picker.description');

  const handleAdd = async (task: MathTaskSearchDocument) => {
    if (insertingId) return;
    setInsertingId(task.id);
    try {
      await onSelect(task);
      if (analyticsSource === 'editor') {
        trackMathTaskInsertNote(toMathBankTaskSnapshot(task), analyticsSource);
      } else {
        trackMathTaskInsertBoard(toMathBankTaskSnapshot(task), analyticsSource);
      }
      onOpenChange(false);
    } finally {
      setInsertingId(null);
    }
  };

  const resetFilters = () => setFilters(DEFAULT_MATH_BANK_FILTERS);

  return (
    <DrawerPrimitive.Root
      direction="right"
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground={false}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay
          className={cn('bg-background-overlay fixed inset-0 z-50', overlayClassName)}
        />
        <DrawerPrimitive.Content
          data-math-bank-drawer
          className={cn(
            'bg-background-surface border-border-default fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-lg flex-col rounded-tl-2xl rounded-bl-2xl border-l outline-none',
            contentClassName,
          )}
        >
          <div className="border-border-default flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
            <DrawerPrimitive.Title className="font-playfair text-text-primary m-0 text-xl font-medium">
              {title}
            </DrawerPrimitive.Title>
            <DrawerPrimitive.Description className="sr-only">
              {descriptionText}
            </DrawerPrimitive.Description>
            <button
              type="button"
              className="hover:bg-background-page flex size-8 shrink-0 items-center justify-center rounded-lg"
              onClick={() => onOpenChange(false)}
              aria-label={t('picker.close')}
            >
              <Close className="fill-icon-primary size-5" />
            </button>
          </div>

          <div className="flex shrink-0 flex-col gap-2 px-4 py-2.5">
            <MathBankSearchField
              value={filters.search}
              onChange={(nextSearch) => setFilters((prev) => ({ ...prev, search: nextSearch }))}
              placeholder={t('search.placeholder')}
              className="sm:w-full"
            />
            <MathBankToolbar
              filters={filters}
              catalog={catalog}
              examIndex={examIndex}
              isCatalogLoading={isLoading}
              onChange={setFilters}
              onReset={resetFilters}
            />
          </div>

          <div
            ref={parentRef}
            className="min-h-0 flex-1 overflow-y-auto px-1 pb-4"
            aria-label={title}
          >
            {isLoading || (!search && !isError) ? (
              <p className="text-s-base text-text-secondary py-10 text-center">
                {t('empty.loadingTitle')}
              </p>
            ) : isError ? (
              <p className="text-s-base text-text-secondary py-10 text-center">
                {t('empty.errorTitle')}
              </p>
            ) : !items.length && filtersActive ? (
              <div className="px-3 py-6">
                <MathBankEmpty
                  onReset={resetFilters}
                  className="flex w-full flex-col items-center justify-center gap-4 px-2 py-8"
                />
              </div>
            ) : !items.length ? (
              <p className="text-s-base text-text-secondary py-10 text-center">
                {t('empty.loadingTitle')}
              </p>
            ) : (
              <GridVirtualizer
                parentRef={parentRef}
                items={items}
                isSingleColumn
                defaultRowHeight={96}
                gap={0}
                overscan={8}
                renderItem={(task) => (
                  <div className="border-border-default border-b">
                    <MathBankPickerRow
                      task={task}
                      addLabel={addLabel}
                      disabled={insertingId === task.id}
                      umamiPrefix={umamiPrefix}
                      onAdd={(next) => {
                        void handleAdd(next);
                      }}
                    />
                  </div>
                )}
              />
            )}
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
};

export const MathBankPicker = (props: MathBankPickerProps) => (
  <div className={props.chromeClassName}>
    <MathBankPickerContent {...props} />
  </div>
);
