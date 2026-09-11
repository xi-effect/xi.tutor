import { useEffect, useRef } from 'react';
import {
  hasMathBankSearchSignal,
  trackMathBankOpen,
  trackMathBankSearch,
  type MathBankAnalyticsSource,
  type MathBankSearchSnapshot,
} from 'common.utils';
import type { BankSubject } from 'features.math.bank';
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
  subject: BankSubject,
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

    openedRef.current = true;
    skipSearchRef.current = true;
    trackMathBankOpen(source, subject);
  }, [enabled, source, subject]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    const snapshot = filtersRef.current;
    if (!hasMathBankSearchSignal(snapshot)) {
      return;
    }

    trackMathBankSearch(snapshot, source, subject);
  }, [debouncedSignature, enabled, source, subject]);
};
