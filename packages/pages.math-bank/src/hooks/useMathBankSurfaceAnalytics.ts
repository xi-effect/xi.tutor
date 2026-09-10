import { useEffect, useRef } from 'react';
import {
  toMathBankSearchProps,
  trackMathBankOpen,
  trackMathBankSearch,
  type MathBankAnalyticsSource,
  type MathBankSearchSnapshot,
} from 'common.utils';
import { useDebouncedValue } from './useDebouncedValue';

const searchSignature = (filters: MathBankSearchSnapshot) =>
  JSON.stringify({
    search: filters.search,
    grades: filters.grades,
    topics: filters.topics,
    difficultyGroups: filters.difficultyGroups,
    exam: filters.exam,
    examTaskNumbers: filters.examTaskNumbers,
    taskTypes: filters.taskTypes,
    favoritesOnly: filters.favoritesOnly,
  });

export const useMathBankSurfaceAnalytics = (
  enabled: boolean,
  source: MathBankAnalyticsSource,
  filters: MathBankSearchSnapshot,
) => {
  const openedRef = useRef(false);
  const skipSearchRef = useRef(true);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const debouncedSignature = useDebouncedValue(searchSignature(filters));

  useEffect(() => {
    if (!enabled) {
      openedRef.current = false;
      skipSearchRef.current = true;
      return;
    }

    if (openedRef.current) {
      return;
    }

    openedRef.current = true;
    trackMathBankOpen(source);
  }, [enabled, source]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    const snapshot = filtersRef.current;
    const props = toMathBankSearchProps(snapshot, source);
    if (!props.has_query && !props.has_filters) {
      return;
    }

    trackMathBankSearch(snapshot, source);
  }, [debouncedSignature, enabled, source]);
};
