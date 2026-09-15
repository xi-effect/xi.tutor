export const MATH_GRADES = [5, 6, 7, 8, 9, 10, 11] as const;
export const MATH_DIFFICULTIES = [1, 2, 3, 4, 5] as const;
export const MATH_BANK_BASE_URL = '/math-bank';
export const RUSSIAN_BANK_BASE_URL = '/task-bank/russian';

export const BANK_SUBJECTS = ['mathematics', 'russian'] as const;
export type BankSubject = (typeof BANK_SUBJECTS)[number];

export const BANK_BASE_URL: Record<BankSubject, string> = {
  mathematics: MATH_BANK_BASE_URL,
  russian: RUSSIAN_BANK_BASE_URL,
};

export const RUSSIAN_TASK_TYPES = [
  'fill_blank',
  'short_answer',
  'restore_punctuation',
  'multiple_choice',
  'multi_choice',
  'open_rubric',
] as const;

export type RussianTaskType = (typeof RUSSIAN_TASK_TYPES)[number];
