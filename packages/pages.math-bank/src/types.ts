import type { ExamKind, MathTaskType } from 'features.math.bank';

export const MATH_BANK_SEARCH_LIMIT = 200;

export type MathDifficultyGroup = 'basic' | 'medium' | 'advanced';

export type MathBankFiltersT = {
  search: string;
  grades: number[];
  topics: string[];
  difficultyGroups: MathDifficultyGroup[];
  exam: ExamKind | null;
  examTaskNumbers: number[];
  taskTypes: MathTaskType[];
  favoritesOnly: boolean;
};

export const DEFAULT_MATH_BANK_FILTERS: MathBankFiltersT = {
  search: '',
  grades: [],
  topics: [],
  difficultyGroups: [],
  exam: null,
  examTaskNumbers: [],
  taskTypes: [],
  favoritesOnly: false,
};

export const DIFFICULTY_GROUP_VALUES: Record<MathDifficultyGroup, number[]> = {
  basic: [1, 2],
  medium: [3],
  advanced: [4, 5],
};

export const MATH_TASK_TYPES: MathTaskType[] = [
  'calculation',
  'short_answer',
  'word_problem',
  'equation',
  'inequality',
  'expression',
  'function',
  'geometry',
  'probability',
  'applied',
  'parameter',
];
