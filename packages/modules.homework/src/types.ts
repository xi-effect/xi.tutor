export const QUESTION_TYPES = [
  'short_text',
  'long_text',
  'single_choice',
  'multiple_choice',
  'dropdown',
  'number',
  'file',
] as const;

export type HomeworkQuestionType = (typeof QUESTION_TYPES)[number];

export type HomeworkOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type HomeworkQuestion = {
  id: string;
  type: HomeworkQuestionType;
  promptHtml: string;
  required: boolean;
  options: HomeworkOption[];
  correctAnswer: string;
};

export type HomeworkContent = {
  estimatedMinutes: number | null;
  allowRetake: boolean;
  showCorrectAnswers: boolean;
  questions: HomeworkQuestion[];
};

export type HomeworkDraft = {
  title: string;
  description: string;
  content: HomeworkContent;
};

export const HOMEWORK_TITLE_MAX = 100;
export const HOMEWORK_DESCRIPTION_MAX = 300;

export const isHomeworkQuestionType = (value: string): value is HomeworkQuestionType =>
  (QUESTION_TYPES as readonly string[]).includes(value);

export const isChoiceQuestionType = (type: HomeworkQuestionType) =>
  type === 'single_choice' || type === 'multiple_choice' || type === 'dropdown';
