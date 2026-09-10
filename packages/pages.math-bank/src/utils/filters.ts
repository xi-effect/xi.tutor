import type { MathTaskSearch, SearchFilters } from 'features.math.bank';
import {
  DEFAULT_MATH_BANK_FILTERS,
  DIFFICULTY_GROUP_VALUES,
  MATH_BANK_SEARCH_LIMIT,
  type MathBankFiltersT,
} from '../types';

export const hasActiveMathBankFilters = (filters: MathBankFiltersT) =>
  Boolean(filters.search.trim()) ||
  filters.grades.length > 0 ||
  filters.topics.length > 0 ||
  filters.difficultyGroups.length > 0 ||
  filters.exam !== null ||
  filters.examTaskNumbers.length > 0 ||
  filters.taskTypes.length > 0 ||
  filters.favoritesOnly;

export const toMathSearchFilters = (
  filters: MathBankFiltersT,
  favoriteTaskIds: string[],
): SearchFilters => ({
  grades: filters.grades.length ? filters.grades : undefined,
  topics: filters.topics.length ? filters.topics : undefined,
  difficulty: filters.difficultyGroups.length
    ? filters.difficultyGroups.flatMap((group) => DIFFICULTY_GROUP_VALUES[group])
    : undefined,
  taskTypes: filters.taskTypes.length ? filters.taskTypes : undefined,
  exam: filters.exam ?? undefined,
  examYear: filters.exam ? 2026 : undefined,
  examTaskNumbers: filters.examTaskNumbers.length ? filters.examTaskNumbers : undefined,
  favoriteIds: filters.favoritesOnly ? favoriteTaskIds : undefined,
});

export const searchMathBank = (
  search: MathTaskSearch | null,
  filters: MathBankFiltersT,
  favoriteTaskIds: string[],
) => {
  if (!search) {
    return [];
  }

  return search.search(
    filters.search,
    toMathSearchFilters(filters, favoriteTaskIds),
    filters.favoritesOnly ? MATH_BANK_SEARCH_LIMIT * 5 : MATH_BANK_SEARCH_LIMIT,
  );
};

export const resetMathBankFilters = (): MathBankFiltersT => ({ ...DEFAULT_MATH_BANK_FILTERS });
