import type { BankSubject, ExamKind, MathTaskType, RussianTaskType } from 'features.math.bank';
import { RUSSIAN_TASK_TYPES } from 'features.math.bank';

export const MATH_BANK_SEARCH_LIMIT = 200;

export type MathDifficultyGroup = 'basic' | 'medium' | 'advanced';

export type BankTaskType = MathTaskType | RussianTaskType;

export type MathBankFiltersT = {
  search: string;
  grades: number[];
  topics: string[];
  difficultyGroups: MathDifficultyGroup[];
  exam: ExamKind | null;
  examTaskNumbers: number[];
  taskTypes: BankTaskType[];
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

export const TASK_TYPES_BY_SUBJECT: Record<BankSubject, readonly BankTaskType[]> = {
  mathematics: MATH_TASK_TYPES,
  russian: RUSSIAN_TASK_TYPES,
};

export const EXAM_KINDS_BY_SUBJECT: Record<BankSubject, readonly ExamKind[]> = {
  mathematics: ['OGE', 'EGE_BASE', 'EGE_PROFILE'],
  russian: ['OGE', 'EGE'],
};
